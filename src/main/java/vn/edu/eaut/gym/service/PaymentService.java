package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
@Service
public class PaymentService {
    private final GymDao db;private final CatalogService catalog;
    public PaymentService(GymDao db,CatalogService catalog){this.db=db;this.catalog=catalog;}
    public Row execute(Row input){
        Row b=new Row(input);String action=b.text("action");if(!action.startsWith("payment."))return null;
        if(!action.equals("payment.create"))return change(b);
        Row registration=b.text("registration_id").isEmpty()?null:db.one("SELECT * FROM registrations WHERE id=?",b.get("registration_id"));
        require(!b.containsKey("registration_id")||registration!=null,"Không tìm thấy đăng ký.",404);
        if(registration!=null){require(!registration.text("status").equals("CANCELLED"),"Đăng ký đã bị hủy.",409);for(String key:List.of("member_id","plan_id","start_date"))b.put(key,registration.get(key));}
        method(b);String request=text(b,"request_id","Mã yêu cầu",16,80),mid=text(b,"member_id","Hội viên",1,80),pid=text(b,"plan_id","Gói tập",1,80);
        require(request.matches("[A-Za-z0-9_-]+"),"Mã yêu cầu không hợp lệ.");String requested=b.text("start_date").isEmpty()?"":date(b.get("start_date"));
        Row old=db.one("SELECT * FROM payments WHERE request_id=?",request);
        if(old!=null){require(old.number("cancelled")==0,"Giao dịch của mã yêu cầu này đã bị hủy.",409);require(old.text("member_id").equals(mid)&&old.text("plan_id").equals(pid)&&old.text("method").equals(b.text("method"))&&old.text("requested_start").equals(requested)&&(!b.containsKey("amount")||integer(b,"amount","Số tiền",0,100000000)==old.number("amount")),"Mã yêu cầu đã được dùng cho nội dung thanh toán khác.",409);return Row.of("ok",true,"id",old.get("id"));}
        if(registration!=null)require(registration.text("status").equals("PENDING"),"Đăng ký đã được thanh toán.",409);
        Row plan=db.one("SELECT * FROM plans WHERE id=? AND active=1 AND deleted=0",pid);
        require(plan!=null&&db.exists("SELECT id FROM members WHERE id=? AND archived=0",mid),"Hội viên hoặc gói tập không còn hoạt động.");
        Row quote=catalog.quote(plan.number("price"));long price=quote.number("price");int days=(int)plan.number("days");String name=plan.text("name");
        if(registration!=null){price=registration.number("price");name=registration.text("plan_name");days=(int)ChronoUnit.DAYS.between(LocalDate.parse(registration.text("start_date")),LocalDate.parse(registration.text("end_date")))+1;}
        require(price>0,"Gói miễn phí được kích hoạt tại Đăng ký gói, không lập phiếu thu.");
        require(!b.containsKey("amount")||integer(b,"amount","Số tiền",0,100000000)==price,"Số tiền phải bằng giá gói tập.");require(!b.containsKey("status")||b.text("status").equals("Đã thanh toán"),"Chỉ ghi nhận hóa đơn khi đã thu đủ tiền.");
        String start=requested;
        if(!start.isEmpty())registrationDates(start,days,today());
        else {Row previous=db.one("SELECT MAX(end_date) AS last_end FROM payments WHERE cancelled=0 AND member_id=?",mid);start=previous!=null&&previous.text("last_end").compareTo(today())>=0?addDays(previous.text("last_end"),1):today();}
        String end=addDays(start,days-1);
        require(!db.exists("SELECT id FROM payments WHERE cancelled=0 AND member_id=? AND start_date<=? AND end_date>=? LIMIT 1",mid,end,start),"Thời hạn bị trùng. Hãy chọn ngày bắt đầu khác.",409);
        String regId=registration==null?UUID.randomUUID().toString():registration.text("id");
        if(registration==null){require(!db.exists("SELECT id FROM registrations WHERE member_id=? AND status<>'CANCELLED' AND start_date<=? AND end_date>=?",mid,end,start),"Đã có đăng ký trong khoảng ngày này. Hãy thu tiền từ mục Đăng ký gói.",409);
            db.update("INSERT INTO registrations(id,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at,original_price,discount_percent,promotion_name) VALUES(?,?,?,?,?,?,?,'ACTIVE',?,?,?,?)",regId,mid,pid,name,price,start,end,GymDao.now(),quote.get("original_price"),quote.get("discount_percent"),quote.get("promotion_name"));
        }else db.update("UPDATE registrations SET status='ACTIVE' WHERE id=?",regId);
        String id=UUID.randomUUID().toString();
        db.update("INSERT INTO payments(id,member_id,plan_id,plan_name,amount,method,start_date,end_date,created_at,request_id,requested_start,registration_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",id,mid,pid,name,price,b.get("method"),start,end,GymDao.now(),request,requested.isEmpty()?null:requested,regId);
        return Row.of("ok",true,"id",id);
    }
    private void method(Row b){require(Set.of("Tiền mặt","Chuyển khoản").contains(b.text("method")),"Phương thức thanh toán không hợp lệ.");}
    private Row change(Row b){
        String id=text(b,"id","Thanh toán",1,80);Row p=db.one("SELECT * FROM payments WHERE id=? AND cancelled=0",id);require(p!=null,"Không tìm thấy thanh toán còn hiệu lực.",404);
        if(b.text("action").equals("payment.update")){method(b);for(String field:List.of("member_id","plan_id","amount","start_date","end_date"))require(!b.containsKey(field)||b.text(field).equals(p.text(field)),"Không thay đổi số tiền hoặc thời hạn của hóa đơn đã thu. Hủy giao dịch rồi lập lại.",409);db.update("UPDATE payments SET method=? WHERE id=?",b.get("method"),id);}
        else {
            String reason=text(b,"reason","Lý do hủy",5,500);require(!db.exists("SELECT id FROM checkins WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0",p.get("member_id")),"Hội viên đang trong phòng tập, cần check-out trước.",409);
            require(!db.exists("SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date BETWEEN ? AND ?",p.get("member_id"),p.get("start_date"),p.get("end_date")),"Cần hủy lịch tập liên quan trước.",409);
            db.update("UPDATE payments SET cancelled=1,cancellation_reason=? WHERE id=?",reason,id);db.update("UPDATE registrations SET status='CANCELLED' WHERE id=?",p.get("registration_id"));
        }return Row.of("ok",true,"id",id);
    }
}
