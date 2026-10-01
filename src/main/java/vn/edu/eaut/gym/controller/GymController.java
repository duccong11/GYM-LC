package vn.edu.eaut.gym.controller;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.service.*;
import vn.edu.eaut.gym.util.Permissions;
import static vn.edu.eaut.gym.util.Validation.*;
import java.util.*;
@RestController
@RequestMapping("/api")
public class GymController {
    private final GymDao db;private final AuthService auth;private final SnapshotService snapshot;private final GymService gym;
    private static final Map<String,String> RESOURCES=Map.ofEntries(Map.entry("promotions","promotion"),Map.entry("services","service"),Map.entry("registrations","registration"),Map.entry("schedules","schedule"),Map.entry("members","member"),Map.entry("plans","plan"),Map.entry("payments","payment"),Map.entry("checkins","checkin"),Map.entry("trainers","trainer"),Map.entry("users","user"),Map.entry("rooms","room"),Map.entry("equipment","equipment"));
    public GymController(GymDao db,AuthService auth,SnapshotService snapshot,GymService gym){this.db=db;this.auth=auth;this.snapshot=snapshot;this.gym=gym;}
    @GetMapping("/health") public Row health(){db.one("SELECT 1 AS ok");return Row.of("status","ok","database","mysql","backend","java");}
    @GetMapping("/gym") public Row get(HttpServletRequest req){return db.transaction(false,()->{Row user=auth.authorize(req,false),data=snapshot.snapshot(user);data.put("user",user);data.put("csrf",user.get("csrf"));return data;});}
    @PostMapping(value="/gym",consumes="application/json") public Row mutate(@RequestBody Row body,HttpServletRequest req){return db.transaction(true,()->gym.execute(body,auth.authorize(req,true)));}
    @GetMapping({"/{resource}","/{resource}/{id}"}) public Object read(@PathVariable String resource,@PathVariable(required=false)String id,HttpServletRequest req){
        require(RESOURCES.containsKey(resource),"Không tìm thấy đường dẫn.",404);
        return db.transaction(false,()->{Row user=auth.authorize(req,false);require(Permissions.read(user.text("role"),resource),"Bạn không có quyền truy cập.",403);
            @SuppressWarnings("unchecked") List<Row> rows=(List<Row>)snapshot.snapshot(user).get(resource);
            if(id==null)return rows;return rows.stream().filter(r->r.text("id").equals(id)).findFirst().orElseThrow(()->new ApiException("Không tìm thấy bản ghi.",404));});
    }
    @RequestMapping(value={"/{resource}","/{resource}/{id}"},method={RequestMethod.POST,RequestMethod.PUT,RequestMethod.DELETE},consumes="application/json")
    public Row write(@PathVariable String resource,@PathVariable(required=false)String id,@RequestBody Row b,HttpServletRequest req){
        require(RESOURCES.containsKey(resource),"Không tìm thấy đường dẫn.",404);String kind=RESOURCES.get(resource),method=req.getMethod();
        require(!(kind.equals("checkin")&&!method.equals("POST")),"Không tìm thấy đường dẫn.",404);
        String op=method.equals("DELETE")?"delete":method.equals("PUT")?(kind.equals("payment")?"update":"save"):Set.of("payment","checkin").contains(kind)?"create":"save";
        b.put("action",kind+"."+op);if(id!=null)b.put("id",id);return mutate(b,req);
    }
    @PatchMapping(value="/{resource}/{id}/{operation}",consumes="application/json") public Row patch(@PathVariable String resource,@PathVariable String id,@PathVariable String operation,@RequestBody Row b,HttpServletRequest req){
        require((resource.equals("members")&&operation.equals("archive"))||(Set.of("plans","users").contains(resource)&&operation.equals("toggle")),"Không tìm thấy đường dẫn.",404);b.put("id",id);b.put("action",RESOURCES.get(resource)+"."+operation);return mutate(b,req);
    }
    @PostMapping(value="/checkins/checkout",consumes="application/json") public Row checkout(@RequestBody Row b,HttpServletRequest req){b.put("action","checkin.checkout");return mutate(b,req);}
}
