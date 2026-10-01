package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@Service
public class FacilityService {
    private final GymDao db;private final CatalogService catalog;
    public FacilityService(GymDao db,CatalogService catalog){this.db=db;this.catalog=catalog;}
    public Row execute(Row b){
        String[] parts=b.text("action").split("\\.");String kind=parts[0];String table=Map.of("trainer","trainers","room","rooms","equipment","equipment").get(kind);if(table==null)return null;
        String id=b.text("id").isEmpty()?UUID.randomUUID().toString():b.text("id");boolean deleting=parts[1].equals("delete");
        if(b.containsKey("id"))require(db.exists("SELECT id FROM "+table+" WHERE id=? AND deleted=0",id),"Không tìm thấy bản ghi.",404);
        if(deleting){guards(kind,id);if(kind.equals("room"))require(!db.exists("SELECT id FROM equipment WHERE room_id=? AND deleted=0 LIMIT 1",id),"Phòng còn thiết bị. Chuyển hoặc xóa thiết bị trước.",409);db.update("UPDATE "+table+" SET deleted=1 WHERE id=?",id);return Row.of("ok",true,"id",id);}
        Row values;List<String> services=null;
        if(kind.equals("trainer")){
            services=catalog.trainerServices(b);values=contact(b);values.put("specialty",catalog.specialty(services));values.put("experience",integer(b,"experience","Kinh nghiệm",0,60));values.put("schedule",text(b,"schedule","Lịch làm việc",2,200));values.put("active",integer(b,"active","Trạng thái",0,1));
            if(!values.text("email").isEmpty())require(!db.exists("SELECT id FROM trainers WHERE email=? AND id<>?",values.get("email"),id),"Email HLV đã tồn tại.",409);
        }else if(kind.equals("room"))values=Row.of("name",text(b,"name","Tên phòng",2,80),"type",text(b,"type","Loại phòng",2,40),"capacity",integer(b,"capacity","Sức chứa",1,1000),"description",text(b,"description","Mô tả",0,200),"active",integer(b,"active","Trạng thái",0,1));
        else{
            String purchased=date(b.get("purchased_at")),condition=text(b,"condition","Tình trạng",1,30),rid=text(b,"room_id","Phòng",1,80);
            require(purchased.compareTo(today())<=0&&purchased.compareTo("1900-01-01")>=0,"Ngày mua không được ở tương lai hoặc trước năm 1900.");require(Set.of("Tốt","Đang sử dụng","Hỏng","Đang bảo trì").contains(condition),"Tình trạng thiết bị không hợp lệ.");require(db.exists("SELECT id FROM rooms WHERE id=? AND deleted=0 AND active=1",rid),"Phòng không tồn tại hoặc ngừng hoạt động.");
            values=Row.of("name",text(b,"name","Tên thiết bị",2,80),"room_id",rid,"quantity",integer(b,"quantity","Số lượng",1,10000),"purchased_at",purchased,"condition",condition);
        }
        if(b.containsKey("id")&&values.containsKey("active")&&values.number("active")==0)guards(kind,id);
        List<Object> args=new ArrayList<>(values.values());
        // Table/column names come only from the fixed model definitions above.
        if(b.containsKey("id")){args.add(id);db.update("UPDATE "+table+" SET "+String.join(",",values.keySet().stream().map(k->"`"+k+"`=?").toList())+" WHERE id=?",args.toArray());}
        else {args.add(0,id);db.update("INSERT INTO "+table+"(id,"+String.join(",",values.keySet().stream().map(k->"`"+k+"`").toList())+") VALUES("+String.join(",",Collections.nCopies(args.size(),"?"))+")",args.toArray());}
        if(services!=null){db.update("DELETE FROM trainer_services WHERE trainer_id=?",id);for(String service:services)db.update("INSERT INTO trainer_services(trainer_id,service_id) VALUES(?,?)",id,service);}
        return Row.of("ok",true,"id",id);
    }
    private void guards(String kind,String id){
        if(kind.equals("trainer"))require(!db.exists("SELECT id FROM members WHERE trainer_id=? AND archived=0 LIMIT 1",id),"HLV đang phụ trách hội viên. Hãy chuyển hoặc bỏ phân công trước.",409);
        if(Set.of("trainer","room").contains(kind))require(!db.exists("SELECT id FROM schedules WHERE "+kind+"_id=? AND status='ACTIVE' AND date>=?",id,today()),"Cần xử lý lịch tập sắp tới trước khi ngừng hoạt động hoặc xóa.",409);
    }
}
