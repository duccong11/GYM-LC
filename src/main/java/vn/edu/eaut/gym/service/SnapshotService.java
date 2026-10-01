package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.Row;
import vn.edu.eaut.gym.util.*;
import java.util.*;
@Service
public class SnapshotService {
    private final GymDao db;
    public SnapshotService(GymDao db){this.db=db;}
    public Row snapshot(Row user){
        String role=user.text("role");boolean scoped=Set.of("MEMBER","TRAINER").contains(role);
        List<String> ids=new ArrayList<>();
        if(role.equals("MEMBER")&&!user.text("member_id").isEmpty())ids.add(user.text("member_id"));
        if(role.equals("TRAINER"))db.rows("SELECT id AS member_id FROM members WHERE trainer_id=? UNION SELECT member_id FROM schedules WHERE trainer_id=? AND status='ACTIVE'",user.text("trainer_id"),user.text("trainer_id")).forEach(r->ids.add(r.text("member_id")));
        String scope=ids.isEmpty()?" IN (NULL)":" IN ("+String.join(",",Collections.nCopies(ids.size(),"?"))+")";
        Object[] args=scoped?ids.toArray():new Object[0];Row result=new Row();
        result.put("members",Permissions.read(role,"members")?db.rows("SELECT members.*,(SELECT name FROM trainers WHERE trainers.id=members.trainer_id) AS trainer_name FROM members"+(scoped?" WHERE id"+scope:"")+" ORDER BY created_at DESC,id",args):List.of());
        result.put("plans",Permissions.read(role,"plans")?db.rows("SELECT * FROM plans WHERE deleted=0 ORDER BY price,id"):List.of());
        List<Row> payments=Permissions.read(role,"payments")?db.rows("SELECT * FROM payments WHERE cancelled=0 ORDER BY created_at DESC,id"):scoped?db.rows("SELECT id,member_id,plan_id,plan_name,0 AS amount,'' AS method,start_date,end_date,created_at,'' AS request_id FROM payments WHERE cancelled=0 AND member_id"+scope,ids.toArray()):List.of();
        result.put("payments",payments);List<Row> entitlements=new ArrayList<>(payments);
        if(Permissions.read(role,"members"))entitlements.addAll(db.rows("SELECT id,member_id,plan_id,plan_name,0 AS amount,'' AS method,start_date,end_date,created_at,'' AS request_id FROM registrations WHERE price=0 AND status='ACTIVE'"+(scoped?" AND member_id"+scope:""),args));
        result.put("entitlements",entitlements);
        result.put("registrations",Permissions.read(role,"registrations")?db.rows("SELECT * FROM registrations"+(scoped?" WHERE member_id"+scope:"")+" ORDER BY created_at DESC,id",args):List.of());
        String scheduleScope=role.equals("MEMBER")?" WHERE s.member_id=?":role.equals("TRAINER")?" WHERE s.trainer_id=?":"";
        result.put("schedules",Permissions.read(role,"schedules")?db.rows("SELECT s.*,m.name AS member_name,t.name AS trainer_name,r.name AS room_name,sv.name AS service_name FROM schedules s JOIN members m ON m.id=s.member_id JOIN trainers t ON t.id=s.trainer_id JOIN rooms r ON r.id=s.room_id LEFT JOIN services sv ON sv.id=s.service_id"+scheduleScope+" ORDER BY s.date DESC,s.start_time,s.id",scoped?new Object[]{user.text(role.equals("MEMBER")?"member_id":"trainer_id")}:new Object[0]):List.of());
        result.put("checkins",Permissions.read(role,"checkins")?db.rows("SELECT * FROM checkins ORDER BY created_at DESC,id"):List.of());
        for(String table:List.of("trainers","rooms","equipment","services"))result.put(table,Permissions.read(role,table)?db.rows("SELECT * FROM "+table+" WHERE deleted=0 ORDER BY name,id"):List.of());
        result.put("promotions",Permissions.read(role,"promotions")?db.rows("SELECT * FROM promotions WHERE deleted=0 ORDER BY start_date DESC,id"):List.of());
        result.put("trainerServices",Permissions.read(role,"trainers")?db.rows("SELECT ts.* FROM trainer_services ts JOIN services s ON s.id=ts.service_id WHERE s.deleted=0"):List.of());
        result.put("users",Permissions.read(role,"users")?db.rows("SELECT id,name,username,phone,email,position,role,active,member_id,trainer_id,created_at FROM accounts ORDER BY created_at DESC,id"):List.of());
        result.put("system",Permissions.read(role,"system")?db.rows("SELECT * FROM system_settings"):List.of());
        result.put("audit",Permissions.read(role,"system")?db.rows("SELECT id,actor_id,action,entity_id,created_at FROM audit_logs ORDER BY created_at DESC,id LIMIT 200"):List.of());
        result.put("staffCount",Permissions.read(role,"overview")?db.one("SELECT COUNT(*) AS n FROM accounts WHERE role IN ('MANAGER','STAFF') AND active=1").number("n"):0);
        result.put("today",Validation.today());return result;
    }
}
