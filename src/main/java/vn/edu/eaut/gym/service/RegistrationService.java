package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@Service
public class RegistrationService {
    private final GymDao db;private final CatalogService catalog;
    public RegistrationService(GymDao db,CatalogService catalog){this.db=db;this.catalog=catalog;}
    public Row execute(Row b,Row actor){
        String action=b.text("action");if(!action.startsWith("registration."))return null;
        String id=b.text("id").isEmpty()?UUID.randomUUID().toString():b.text("id");
        if(action.equals("registration.delete")){
            Row old=db.one("SELECT * FROM registrations WHERE id=?",id);require(old!=null,"Không tìm thấy đăng ký.",404);
            require(!db.exists("SELECT id FROM checkins WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0",old.get("member_id")),"Cần check-out trước khi hủy đăng ký.",409);
            require(!db.exists("SELECT id FROM payments WHERE registration_id=? AND cancelled=0",id),"Cần hủy thanh toán trước khi hủy đăng ký đã thu tiền.",409);
            require(!db.exists("SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date BETWEEN ? AND ?",old.get("member_id"),old.get("start_date"),old.get("end_date")),"Cần hủy lịch tập trong thời hạn trước khi hủy đăng ký.",409);
            db.update("UPDATE registrations SET status='CANCELLED' WHERE id=?",id);
        }else{
            String mid=text(b,"member_id","Hội viên",1,80),pid=text(b,"plan_id","Gói tập",1,80);Row plan=db.one("SELECT * FROM plans WHERE id=? AND active=1 AND deleted=0",pid);
            require(plan!=null&&db.exists("SELECT id FROM members WHERE id=? AND archived=0",mid),"Hội viên hoặc gói tập không còn hoạt động.");
            Row quote=catalog.quote(plan.number("price")),dates=registrationDates(b.get("start_date"),(int)plan.number("days"),today());
            if(b.containsKey("id")){Row old=db.one("SELECT * FROM registrations WHERE id=?",id);require(old!=null,"Không tìm thấy đăng ký.",404);require(old.text("status").equals("PENDING"),"Chỉ được sửa đăng ký đang chờ thanh toán.",409);require(!actor.text("role").equals("STAFF")||old.text("member_id").equals(mid),"Nhân viên không được chuyển đăng ký sang hội viên khác.",403);}
            require(!db.exists("SELECT id FROM registrations WHERE member_id=? AND status<>'CANCELLED' AND start_date<=? AND end_date>=? AND id<>?",mid,dates.get("end"),dates.get("start"),id),"Hội viên đã có đăng ký trùng thời hạn.",409);
            if(b.containsKey("id"))db.update("UPDATE registrations SET member_id=?,plan_id=?,plan_name=?,price=?,start_date=?,end_date=? WHERE id=?",mid,pid,plan.get("name"),quote.get("price"),dates.get("start"),dates.get("end"),id);
            else db.update("INSERT INTO registrations(id,member_id,plan_id,plan_name,price,start_date,end_date,status,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)",id,mid,pid,plan.get("name"),quote.get("price"),dates.get("start"),dates.get("end"),GymDao.now());
            db.update("UPDATE registrations SET original_price=?,discount_percent=?,promotion_name=? WHERE id=?",quote.get("original_price"),quote.get("discount_percent"),quote.get("promotion_name"),id);
            if(quote.number("price")==0)db.update("UPDATE registrations SET status='ACTIVE' WHERE id=?",id);
        }
        return Row.of("ok",true,"id",id);
    }
}
