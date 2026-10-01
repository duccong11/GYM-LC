package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@Service
public class MemberService {
    private final GymDao db;
    public MemberService(GymDao db){this.db=db;}
    public Row execute(Row b){String action=b.text("action"),id=b.text("id").isEmpty()?UUID.randomUUID().toString():b.text("id");
        if(action.equals("member.save")){
            Row c=contact(b);String gender=b.containsKey("gender")?b.text("gender"):"Khác",birth=b.text("birth_date").isEmpty()?null:date(b.get("birth_date")),address=text(b,"address","Địa chỉ",0,250);
            require(Set.of("Nam","Nữ","Khác").contains(gender),"Giới tính không hợp lệ.");
            require(birth==null||(birth.compareTo(today())<=0&&birth.compareTo("1900-01-01")>=0),"Ngày sinh phải từ 1900 đến hôm nay.");
            if(!c.text("email").isEmpty())require(!db.exists("SELECT id FROM members WHERE email=? AND id<>?",c.get("email"),id),"Email hội viên đã tồn tại.",409);
            String trainer=text(b,"trainer_id","HLV phụ trách",0,80);
            require(trainer.isEmpty()||db.exists("SELECT id FROM trainers WHERE id=? AND active=1 AND deleted=0",trainer),"HLV không tồn tại hoặc đã ngừng hoạt động.");
            if(b.containsKey("id")){require(db.exists("SELECT id FROM members WHERE id=? AND archived=0",id),"Không tìm thấy hội viên đang quản lý.",404);db.update("UPDATE members SET name=?,phone=?,email=?,gender=?,birth_date=?,address=? WHERE id=?",c.get("name"),c.get("phone"),c.get("email"),gender,birth,address,id);}
            else db.update("INSERT INTO members(id,name,phone,email,gender,created_at,birth_date,address) VALUES(?,?,?,?,?,?,?,?)",id,c.get("name"),c.get("phone"),c.get("email"),gender,GymDao.now(),birth,address);
            if(b.containsKey("trainer_id"))db.update("UPDATE members SET trainer_id=? WHERE id=?",trainer.isEmpty()?null:trainer,id);
        }else if(action.equals("member.archive")||action.equals("member.delete")){
            require(!b.containsKey("archived")||b.get("archived") instanceof Boolean,"Trạng thái lưu trữ phải là boolean.");boolean archive=!Boolean.FALSE.equals(b.get("archived"));
            if(archive){require(!db.exists("SELECT id FROM checkins WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0",id),"Cần check-out trước khi lưu trữ hội viên đang tập.",409);require(!db.exists("SELECT id FROM schedules WHERE member_id=? AND status='ACTIVE' AND date>=?",id,today()),"Cần hủy lịch tập sắp tới trước khi lưu trữ hội viên.",409);}
            require(db.exists("SELECT id FROM members WHERE id=?",id),"Không tìm thấy hội viên.",404);db.update("UPDATE members SET archived=? WHERE id=?",archive?1:0,id);
        }else if(action.equals("plan.save")){
            String name=text(b,"name","Tên gói",3,100),description=text(b,"description","Mô tả",0,200);int days=integer(b,"days","Thời hạn",1,730),price=integer(b,"price","Giá gói",0,100000000);
            if(b.containsKey("id")){require(db.exists("SELECT id FROM plans WHERE id=? AND deleted=0",id),"Không tìm thấy gói tập.",404);db.update("UPDATE plans SET name=?,days=?,price=?,description=? WHERE id=?",name,days,price,description,id);}
            else db.update("INSERT INTO plans(id,name,days,price,description) VALUES(?,?,?,?,?)",id,name,days,price,description);
        }else if(action.equals("plan.toggle")||action.equals("plan.delete")){
            require(db.exists("SELECT id FROM plans WHERE id=? AND deleted=0",id),"Không tìm thấy gói tập.",404);
            if(action.equals("plan.delete"))db.update("UPDATE plans SET deleted=1,active=0 WHERE id=?",id);
            else {require(b.get("active") instanceof Boolean,"Trạng thái phải là boolean.");db.update("UPDATE plans SET active=? WHERE id=?",Boolean.TRUE.equals(b.get("active"))?1:0,id);}
        }else if(action.equals("checkin.create")){
            int n=db.update("INSERT INTO checkins(id,member_id,date,created_at,checkout_at) SELECT ?,m.id,?,?,NULL FROM members m WHERE m.id=? AND m.archived=0 AND EXISTS(SELECT 1 FROM registrations p WHERE p.status='ACTIVE' AND p.member_id=m.id AND p.start_date<=? AND p.end_date>=?)",id,today(),GymDao.now(),b.text("member_id"),today(),today());require(n>0,"Hội viên chưa có gói còn hạn hoặc đã bị lưu trữ.");
        }else if(action.equals("checkin.checkout")){
            require(db.update("UPDATE checkins SET checkout_at=? WHERE member_id=? AND checkout_at IS NULL AND legacy_closed=0",GymDao.now(),b.text("member_id"))>0,"Hội viên chưa check-in hoặc đã check-out.",409);
        }else return null;
        return Row.of("ok",true,"id",id);
    }
}
