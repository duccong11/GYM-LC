package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.util.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
import java.time.*;

@Service
public class AuthService {
    private final GymDao db;
    private final Set<String> origins;
    private final boolean secure;
    public AuthService(GymDao db,@Value("${FRONTEND_ORIGIN:http://localhost:3000,http://127.0.0.1:3000,http://localhost:4000,http://127.0.0.1:4000}") String origins,@Value("${NODE_ENV:development}") String env){this.db=db;this.origins=Set.of(origins.split(","));this.secure=env.equals("production");}
    public void sameOrigin(HttpServletRequest req){require(origins.contains(Objects.toString(req.getHeader("Origin"),"")),"Nguồn yêu cầu không hợp lệ.",403);}
    public String cookie(String token,int seconds){return "gym_session="+token+"; HttpOnly; SameSite=Strict; Path=/; Max-Age="+seconds+(secure?"; Secure":"");}
    public Row session(String cookie){
        String token="";
        if(cookie!=null)for(String part:cookie.split(";"))if(part.trim().startsWith("gym_session="))token=part.trim().substring(12);
        if(!token.matches("[a-f0-9]{64}"))return null;
        return db.one("SELECT a.id,a.name,a.username,a.role,a.phone,a.email,a.position,a.active,a.member_id,a.trainer_id,s.csrf,s.id AS session_id FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.id=? AND s.expires_at>? AND a.active=1",Passwords.digest(token),GymDao.now());
    }
    public Row authorize(HttpServletRequest req,boolean write){
        Row user=session(req.getHeader("Cookie"));require(user!=null,"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",401);
        if(write){sameOrigin(req);require(user.text("csrf").equals(req.getHeader("X-CSRF-Token")),"Mã bảo vệ phiên không hợp lệ.",403);}return user;
    }
    public void logout(HttpServletRequest req){db.transaction(true,()->{Row u=authorize(req,true);db.update("DELETE FROM sessions WHERE id=?",u.text("session_id"));return null;});}
    public void register(Row b){
        Row c=contact(b);String username=text(b,"username","Tên đăng nhập",5,30).toLowerCase(Locale.ROOT);
        require(username.matches("[a-z0-9_]+"),"Tên đăng nhập chỉ gồm chữ, số và gạch dưới.");require(!c.text("email").isEmpty(),"Email không được để trống.");
        String password=password(b.get("password"));require(password.equals(b.get("confirm_password")),"Xác nhận mật khẩu không khớp.");
        require(!b.containsKey("role")||b.text("role").equals("MEMBER"),"Đăng ký công khai chỉ dành cho hội viên.",403);
        String hash=Passwords.hash(password);
        db.transaction(true,()->{
            require(!db.exists("SELECT id FROM accounts WHERE username=? OR email=?",username,c.get("email")),"Tên đăng nhập hoặc email đã tồn tại.",409);
            require(!db.exists("SELECT id FROM members WHERE phone=? OR email=?",c.get("phone"),c.get("email")),"Hồ sơ hội viên đã tồn tại. Liên hệ nhân viên để liên kết tài khoản.",409);
            String mid=UUID.randomUUID().toString();
            db.update("INSERT INTO members(id,name,phone,email,gender,created_at,code) VALUES(?,?,?,?,'Khác',?,?)",mid,c.get("name"),c.get("phone"),c.get("email"),GymDao.now(),"HV"+mid.replace("-","").substring(0,16).toUpperCase());
            db.update("INSERT INTO accounts(id,name,username,password_hash,phone,email,position,role,active,created_at,member_id) VALUES(?,?,?,?,?,?,'Hội viên','MEMBER',1,?,?)",UUID.randomUUID().toString(),c.get("name"),username,hash,c.get("phone"),c.get("email"),GymDao.now(),mid);
            return null;
        });
    }
    public Row login(Row b,String cookie){
        String username=text(b,"username","Tên đăng nhập",1,100).toLowerCase(Locale.ROOT);
        require(b.get("password") instanceof String&&!b.text("password").isBlank()&&b.text("password").length()<=128,"Mật khẩu không được trống và tối đa 128 ký tự.");
        // Commit failed-attempt counters independently from the login transaction.
        long attempts=db.transaction(true,()->{
            String now=GymDao.now(),reset=LocalDateTime.now(ZoneOffset.UTC).plusMinutes(15).toString().replace('T',' ');
            db.update("INSERT INTO login_attempts(username,attempts,reset_at) VALUES(?,1,?) ON DUPLICATE KEY UPDATE attempts=IF(reset_at<=?,1,attempts+1),reset_at=IF(reset_at<=?,?,reset_at)",username,reset,now,now,reset);
            return db.one("SELECT attempts FROM login_attempts WHERE username=?",username).number("attempts");
        });
        require(attempts<=5,"Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.",429);
        return db.transaction(true,()->{
            Row a=db.one("SELECT * FROM accounts WHERE username=? OR email=?",username,username);
            String hash=a==null?Passwords.hash("dummy-password-value","dummy-salt-for-timing"):a.text("password_hash");
            require(Passwords.verify(b.text("password"),hash)&&a!=null&&a.number("active")==1,"Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.",401);
            String token=Passwords.token(),csrf=Passwords.token();Row old=session(cookie);
            db.update("DELETE FROM login_attempts WHERE username=?",username);db.update("DELETE FROM sessions WHERE expires_at<=?",GymDao.now());
            if(old!=null)db.update("DELETE FROM sessions WHERE id=?",old.text("session_id"));
            db.update("INSERT INTO sessions(id,account_id,csrf,expires_at) VALUES(?,?,?,?)",Passwords.digest(token),a.get("id"),csrf,LocalDateTime.now(ZoneOffset.UTC).plusHours(8).toString().replace('T',' '));
            return Row.of("token",token,"csrf",csrf,"user",Row.of("id",a.get("id"),"name",a.get("name"),"username",a.get("username"),"role",a.get("role")));
        });
    }
}
