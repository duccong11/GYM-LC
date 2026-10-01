package vn.edu.eaut.gym.util;
import java.util.*;
public final class Permissions {
    private Permissions() {}
    private static Set<String> set(String v){return Set.of(v.split(","));}
    public static final Map<String,Set<String>> READ=Map.of(
        "ADMIN",set("users,system"),
        "MANAGER",set("search,overview,members,plans,registrations,payments,schedules,reports,checkins,trainers,rooms,equipment,services,promotions"),
        "STAFF",set("search,members,plans,registrations,payments,schedules,checkins,trainers,rooms,equipment,services,promotions"),
        "TRAINER",set("search,schedules,members,plans,rooms"),
        "MEMBER",set("search,members,plans,registrations,schedules"));
    private static final Map<String,Set<String>> WRITE=Map.of(
        "ADMIN",set("user.save,user.toggle,user.delete,system.save"),
        "MANAGER",set("member.save,member.archive,member.delete,promotion.save,promotion.delete,service.save,service.delete,plan.save,plan.toggle,plan.delete,registration.save,registration.delete,payment.create,payment.update,payment.delete,schedule.save,schedule.delete,trainer.save,trainer.delete,room.save,room.delete,equipment.save,equipment.delete,checkin.create,checkin.checkout"),
        "STAFF",set("member.save,registration.save,schedule.save,payment.create,checkin.create,checkin.checkout"),"TRAINER",Set.of(),"MEMBER",Set.of());
    public static boolean read(String role,String resource){return READ.getOrDefault(role,Set.of()).contains(resource);}
    public static boolean write(String role,String action){return WRITE.getOrDefault(role,Set.of()).contains(action);}
}
