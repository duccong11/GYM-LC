package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.util.Passwords;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@Service
public class AccountService {
    private final GymDao db;
    public AccountService(GymDao db){this.db=db;}
    public Row execute(Row b,Row actor){
        String action=b.text("action");
        if(action.equals("system.save")){db.update("UPDATE system_settings SET gym_name=?,opening_hours=? WHERE id=1",text(b,"gym_name","Tên phòng GYM",2,100),text(b,"opening_hours","Giờ hoạt động",2,100));return Row.of("ok",true,"id","1");}
        if(!action.startsWith("user."))return null;
        String id=b.text("id").isEmpty()?UUID.randomUUID().toString():b.text("id");Row current=db.one("SELECT * FROM accounts WHERE id=?",id);
        if(b.containsKey("id"))require(current!=null,"Không tìm thấy tài khoản.",404);
        if(!action.equals("user.save")){
            boolean active=false;if(action.equals("user.toggle")){require(b.get("active") instanceof Boolean,"Trạng thái phải là boolean.");active=Boolean.TRUE.equals(b.get("active"));}
            require(current!=null,"Không tìm thấy tài khoản.",404);protect(current,actor,current.text("role"),active?1:0);
            db.update("UPDATE accounts SET active=? WHERE id=?",active?1:0,id);if(!active)db.update("DELETE FROM sessions WHERE account_id=?",id);
            return Row.of("ok",true,"id",id);
        }
        Row c=contact(b);String username=text(b,"username","Tên đăng nhập",5,30).toLowerCase(Locale.ROOT),role=b.text("role"),position=text(b,"position","Chức vụ",0,80);
        require(username.matches("[a-z0-9_.-]+"),"Tên đăng nhập chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.");require(Set.of("ADMIN","MANAGER","STAFF","TRAINER","MEMBER").contains(role),"Vai trò không hợp lệ.");
        String member=role.equals("MEMBER")?linked(b,"member_id","members","archived=0"):null;
        String trainer=role.equals("TRAINER")?linked(b,"trainer_id","trainers","deleted=0 AND active=1"):null;
        if(!c.text("email").isEmpty())require(!db.exists("SELECT id FROM accounts WHERE email=? AND id<>?",c.get("email"),id),"Email tài khoản đã tồn tại.",409);
        int active=integer(b,"active","Trạng thái",0,1);if(current!=null)protect(current,actor,role,active);
        String hash=b.text("password").isEmpty()?null:Passwords.hash(password(b.get("password")));
        if(current!=null){db.update("UPDATE accounts SET name=?,username=?,phone=?,email=?,position=?,role=?,active=?,password_hash=COALESCE(?,password_hash),member_id=?,trainer_id=? WHERE id=?",c.get("name"),username,c.get("phone"),c.get("email"),position,role,active,hash,member,trainer,id);db.update("DELETE FROM sessions WHERE account_id=?",id);}
        else {require(hash!=null,"Mật khẩu không được bỏ trống.");db.update("INSERT INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at,member_id,trainer_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",id,c.get("name"),username,hash,c.get("phone"),c.get("email"),position,role,active,GymDao.now(),member,trainer);}
        return Row.of("ok",true,"id",id);
    }
    private String linked(Row b,String key,String table,String condition){String id=text(b,key,"Hồ sơ liên kết",1,80);Row r=db.one("SELECT id FROM "+table+" WHERE (id=? OR code=?) AND "+condition,id,id);require(r!=null,"Hồ sơ không tồn tại hoặc đã ngừng hoạt động.");return r.text("id");}
    private void protect(Row current,Row actor,String role,int active){
        require(!current.text("id").equals(actor.text("id"))||(role.equals(actor.text("role"))&&active==1),"Không được tự khóa hoặc hạ quyền tài khoản đang dùng.",409);
        if(current.text("role").equals("ADMIN")&&current.number("active")==1&&(!role.equals("ADMIN")||active==0))require(db.one("SELECT COUNT(*) AS n FROM accounts WHERE role='ADMIN' AND active=1").number("n")>1,"Phải giữ ít nhất một Admin đang hoạt động.",409);
    }
}
