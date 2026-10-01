package vn.edu.eaut.gym.controller.auth;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.service.AuthService;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth){this.auth=auth;}
    @GetMapping public Row current(HttpServletRequest req){Row user=auth.authorize(req,false);return Row.of("user",user,"csrf",user.get("csrf"));}
    @PostMapping(consumes="application/json") public ResponseEntity<Row> post(@RequestBody Row b,HttpServletRequest req){
        auth.sameOrigin(req);
        return switch(b.text("action")) {
            case "logout" -> {auth.logout(req);yield ResponseEntity.ok().header("Set-Cookie",auth.cookie("",0)).body(Row.of("ok",true));}
            case "register" -> {auth.register(b);yield ResponseEntity.status(201).body(Row.of("ok",true,"message","Đăng ký thành công. Vui lòng đăng nhập."));}
            case "login" -> {Row r=auth.login(b,req.getHeader("Cookie"));yield ResponseEntity.ok().header("Set-Cookie",auth.cookie(r.text("token"),28800)).body(Row.of("ok",true,"user",r.get("user"),"csrf",r.get("csrf")));}
            default -> throw new ApiException("Thao tác không hợp lệ.");
        };
    }
}
