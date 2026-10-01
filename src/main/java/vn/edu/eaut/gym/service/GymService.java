package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.util.Permissions;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@Service
public class GymService {
    private final GymDao db;private final CatalogService catalog;private final MemberService members;private final RegistrationService registrations;private final PaymentService payments;private final ScheduleService schedules;private final FacilityService facilities;private final AccountService accounts;
    public GymService(GymDao db,CatalogService catalog,MemberService members,RegistrationService registrations,PaymentService payments,ScheduleService schedules,FacilityService facilities,AccountService accounts){this.db=db;this.catalog=catalog;this.members=members;this.registrations=registrations;this.payments=payments;this.schedules=schedules;this.facilities=facilities;this.accounts=accounts;}
    private static final Map<String,String> TABLES=Map.of("member.save","members","plan.save","plans","trainer.save","trainers","registration.save","registrations","schedule.save","schedules","payment.create","payments");
    private static final Map<String,String> PREFIX=Map.of("members","HV","plans","GT","trainers","HLV","registrations","DK","schedules","LT","payments","TT");
    /** Caller owns the write transaction; permission, mutation and audit are atomic. */
    public Row execute(Row b,Row actor){
        String action=text(b,"action","Thao tác",1,50);require(Permissions.write(actor.text("role"),action),"Bạn không có quyền thực hiện thao tác này.",403);
        String table=TABLES.get(action),code=null;
        if(table!=null){
            if(b.containsKey("code")){code=text(b,"code","Mã nghiệp vụ",table.equals("plans")?3:5,20).toUpperCase(Locale.ROOT);require(code.matches("[A-Z0-9]+"),"Mã chỉ gồm chữ không dấu và số.");Row existing=db.one("SELECT * FROM "+table+" WHERE code=? AND id<>?",code,b.text("id"));require(existing==null||(action.equals("payment.create")&&existing.text("request_id").equals(b.text("request_id"))),"Mã nghiệp vụ đã tồn tại.",409);}
            else if(!b.containsKey("id"))code=PREFIX.get(table)+UUID.randomUUID().toString().replace("-","").substring(0,16).toUpperCase();
        }
        String kind=action.split("\\.")[0];
        Row result=switch(kind){
            case "promotion","service" -> catalog.execute(b);
            case "member","plan","checkin" -> members.execute(b);
            case "registration" -> registrations.execute(b,actor);
            case "payment" -> payments.execute(b);
            case "schedule" -> schedules.execute(b);
            case "trainer","room","equipment" -> facilities.execute(b);
            case "user","system" -> accounts.execute(b,actor);
            default -> throw new ApiException("Thao tác không được hỗ trợ.");
        };
        if(table!=null&&code!=null&&result!=null&&!result.text("id").isEmpty()){
            Row old=db.one("SELECT code FROM "+table+" WHERE id=?",result.get("id"));
            if(old!=null&&(old.text("code").isEmpty()||b.containsKey("id")))db.update("UPDATE "+table+" SET code=? WHERE id=?",code,result.get("id"));
        }
        if(action.equals("payment.create"))db.update("UPDATE registrations r JOIN payments p ON p.registration_id=r.id SET r.code=CONCAT('DK',UPPER(LEFT(SHA2(r.id,256),16))) WHERE p.id=? AND r.code IS NULL",result.get("id"));
        db.audit(actor.text("id"),action,result==null?b.text("id"):result.text("id"));return result;
    }
}
