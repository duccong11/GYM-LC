package vn.edu.eaut.gym.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class HomeController {
    @GetMapping({"/","/login","/admin/users","/overview","/members","/plans","/payments","/checkins","/trainers","/users","/rooms","/equipment","/registrations","/schedules","/reports","/system","/search","/services","/promotions"})
    public String index(){return "forward:/index.html";}
}
