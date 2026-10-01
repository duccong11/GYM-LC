package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;

@Service
public class CatalogService {
    private final GymDao db;
    public CatalogService(GymDao db){this.db=db;}
    public static long discountedPrice(long price,int percent){require(price>=0&&percent>=0&&percent<=100,"Giá hoặc phần trăm giảm không hợp lệ.");return Math.round(price*(100-percent)/100.0);}
    public Row quote(long price){Row p=db.one("SELECT * FROM promotions WHERE deleted=0 AND active=1 AND start_date<=? AND end_date>=? ORDER BY percent DESC,id LIMIT 1",today(),today());int percent=p==null?0:(int)p.number("percent");return Row.of("price",discountedPrice(price,percent),"original_price",price,"discount_percent",percent,"promotion_name",p==null?"":p.get("name"));}
    public Row execute(Row b){
        String action=b.text("action"),id=b.text("id").isEmpty()?UUID.randomUUID().toString():text(b,"id","Mã",1,80);
        if(action.startsWith("promotion.")){
            if(b.containsKey("id"))require(db.exists("SELECT id FROM promotions WHERE id=? AND deleted=0",id),"Không tìm thấy khuyến mãi.",404);
            if(action.equals("promotion.delete")){require(b.containsKey("id"),"Thiếu khuyến mãi cần xóa.");db.update("UPDATE promotions SET deleted=1,active=0 WHERE id=?",id);}
            else {
                String name=text(b,"name","Tên khuyến mãi",2,100),start=date(b.get("start_date")),end=date(b.get("end_date"));int percent=integer(b,"percent","Phần trăm giảm",1,100),active=integer(b,"active","Trạng thái",0,1);
                require(end.compareTo(start)>=0,"Ngày kết thúc phải từ ngày bắt đầu trở đi.");
                if(b.containsKey("id"))db.update("UPDATE promotions SET name=?,percent=?,start_date=?,end_date=?,active=? WHERE id=?",name,percent,start,end,active,id);
                else db.update("INSERT INTO promotions(id,name,percent,start_date,end_date,active) VALUES(?,?,?,?,?,?)",id,name,percent,start,end,active);
            }return Row.of("ok",true,"id",id);
        }
        if(action.startsWith("service.")){
            if(b.containsKey("id"))require(db.exists("SELECT id FROM services WHERE id=? AND deleted=0",id),"Không tìm thấy dịch vụ.",404);
            boolean future=db.exists("SELECT id FROM schedules WHERE service_id=? AND status='ACTIVE' AND date>=?",id,today());
            if(action.equals("service.delete")){require(b.containsKey("id"),"Thiếu dịch vụ cần xóa.");require(!future,"Dịch vụ còn lịch tập sắp tới. Hãy hủy hoặc đổi lịch trước.",409);db.update("UPDATE services SET active=0,deleted=1 WHERE id=?",id);}
            else {
                String name=text(b,"name","Tên dịch vụ",2,100),description=text(b,"description","Mô tả",0,500);int active=integer(b,"active","Trạng thái",0,1);
                require(!db.exists("SELECT id FROM services WHERE name=? AND id<>?",name,id),"Tên dịch vụ đã tồn tại, kể cả dịch vụ đã lưu trữ.",409);
                require(active==1||!future,"Không thể ngừng dịch vụ đang có lịch sắp tới.",409);
                if(b.containsKey("id"))db.update("UPDATE services SET name=?,description=?,active=? WHERE id=?",name,description,active,id);
                else db.update("INSERT INTO services(id,name,description,active) VALUES(?,?,?,?)",id,name,description,active);
            }return Row.of("ok",true,"id",id);
        }
        return null;
    }
    public List<String> trainerServices(Row b){
        Object raw=b.get("service_ids");require(raw instanceof List<?> list&&!list.isEmpty()&&list.size()<=200,"Chọn ít nhất một dịch vụ giảng dạy.");
        Set<String> unique=new LinkedHashSet<>();
        for(Object v:(List<?>)raw){require(v instanceof String&&!v.toString().isEmpty()&&v.toString().length()<=80,"Dịch vụ không hợp lệ.");unique.add(v.toString());}
        for(String id:unique){Row s=db.one("SELECT name,active FROM services WHERE id=? AND deleted=0",id);require(s!=null,"Dịch vụ không tồn tại.");require(s.number("active")==1||db.exists("SELECT trainer_id FROM trainer_services WHERE trainer_id=? AND service_id=?",b.text("id"),id),"Không thể phân công mới dịch vụ đã ngừng.");}
        for(Row r:db.rows("SELECT service_id FROM schedules WHERE trainer_id=? AND status='ACTIVE' AND date>=?",b.text("id"),today()))require(unique.contains(r.text("service_id")),"HLV còn lịch sắp tới của dịch vụ bị bỏ chọn. Hãy chuyển hoặc hủy lịch trước.",409);
        return new ArrayList<>(unique);
    }
    public String specialty(List<String> ids){String s=String.join(", ",ids.stream().map(id->db.one("SELECT name FROM services WHERE id=?",id).text("name")).toList());return s.substring(0,Math.min(120,s.length()));}
}
