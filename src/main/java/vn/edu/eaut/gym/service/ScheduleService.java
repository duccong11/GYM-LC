package vn.edu.eaut.gym.service;
import org.springframework.stereotype.Service;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
@Service
public class ScheduleService {
    private final GymDao db;
    public ScheduleService(GymDao db){this.db=db;}
    public Row execute(Row b){
        String action=b.text("action");if(!action.startsWith("schedule."))return null;
        String id=b.text("id").isEmpty()?UUID.randomUUID().toString():b.text("id");
        if(action.equals("schedule.delete")){require(db.update("UPDATE schedules SET status='CANCELLED' WHERE id=? AND status='ACTIVE'",id)>0,"Không tìm thấy lịch đang hoạt động.",404);return Row.of("ok",true,"id",id);}
        String service=text(b,"service_id","Dịch vụ",1,80),mid=text(b,"member_id","Hội viên",1,80),tid=text(b,"trainer_id","HLV",1,80),rid=text(b,"room_id","Phòng",1,80);
        require(db.exists("SELECT s.id FROM services s JOIN trainer_services ts ON ts.service_id=s.id WHERE s.id=? AND s.active=1 AND s.deleted=0 AND ts.trainer_id=?",service,tid),"HLV không được phân công cho dịch vụ này hoặc dịch vụ đã ngừng hoạt động.");
        String date=date(b.get("date")),start=text(b,"start_time","Giờ bắt đầu",5,5),end=text(b,"end_time","Giờ kết thúc",5,5),note=text(b,"note","Ghi chú",0,500);
        require(start.matches("([01]\\d|2[0-3]):[0-5]\\d")&&end.matches("([01]\\d|2[0-3]):[0-5]\\d")&&end.compareTo(start)>0,"Giờ kết thúc phải sau giờ bắt đầu.");
        long minutes=ChronoUnit.MINUTES.between(LocalTime.parse(start),LocalTime.parse(end));require(minutes>=30&&minutes<=180,"Thời lượng buổi tập phải từ 30 đến 180 phút.");require(date.compareTo(today())>=0,"Không tạo hoặc sửa lịch trong quá khứ.");
        require(db.exists("SELECT id FROM members WHERE id=? AND archived=0",mid)&&db.exists("SELECT id FROM trainers WHERE id=? AND active=1 AND deleted=0",tid)&&db.exists("SELECT id FROM rooms WHERE id=? AND active=1 AND deleted=0",rid),"Hội viên, HLV hoặc phòng không còn hoạt động.");
        require(db.exists("SELECT id FROM registrations WHERE member_id=? AND status='ACTIVE' AND start_date<=? AND end_date>=?",mid,date,date),"Hội viên cần có gói đã thanh toán còn hiệu lực vào ngày tập.");
        if(b.containsKey("id"))require(db.exists("SELECT id FROM schedules WHERE id=? AND status='ACTIVE'",id),"Không tìm thấy lịch đang hoạt động.",404);
        require(!db.exists("SELECT id FROM schedules WHERE status='ACTIVE' AND date=? AND start_time<? AND end_time>? AND id<>? AND (member_id=? OR trainer_id=? OR room_id=?)",date,end,start,id,mid,tid,rid),"Trùng lịch hội viên, HLV hoặc phòng tập.",409);
        if(b.containsKey("id"))db.update("UPDATE schedules SET member_id=?,trainer_id=?,room_id=?,date=?,start_time=?,end_time=?,note=?,service_id=? WHERE id=?",mid,tid,rid,date,start,end,note,service,id);
        else db.update("INSERT INTO schedules(id,member_id,trainer_id,room_id,date,start_time,end_time,note,status,created_at,service_id) VALUES(?,?,?,?,?,?,?,?,'ACTIVE',?,?)",id,mid,tid,rid,date,start,end,note,GymDao.now(),service);
        return Row.of("ok",true,"id",id);
    }
}
