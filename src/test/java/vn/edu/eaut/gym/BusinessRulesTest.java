package vn.edu.eaut.gym;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.util.*;
import vn.edu.eaut.gym.service.CatalogService;
class BusinessRulesTest {
    @Test void passwordsRemainCompatibleWithNode(){String hash=Passwords.hash("MậtKhẩu2026!","fixed-salt");assertEquals("pbkdf2:100000:fixed-salt:35e4580f8dcd752f4bd5ecd5cada44597bc5ccd0a082810c08412919e9565108",hash);assertTrue(Passwords.verify("MậtKhẩu2026!",hash));assertFalse(Passwords.verify("wrong",hash));assertFalse(Passwords.verify("x","bad"));}
    @Test void actorBoundaries(){assertFalse(Permissions.write("ADMIN","member.save"));assertTrue(Permissions.write("ADMIN","user.save"));assertTrue(Permissions.write("MANAGER","promotion.save"));assertFalse(Permissions.write("STAFF","plan.save"));assertFalse(Permissions.write("TRAINER","schedule.save"));assertFalse(Permissions.read("MEMBER","payments"));assertFalse(Permissions.write("UNKNOWN","user.save"));}
    @Test void registrationBoundary(){assertEquals("2026-09-30",Validation.registrationDates("2026-09-30",1,"2026-09-30").text("end"));assertThrows(ApiException.class,()->Validation.registrationDates("2026-09-29",30,"2026-09-30"));assertThrows(ApiException.class,()->Validation.registrationDates("2026-09-30",731,"2026-09-30"));assertThrows(ApiException.class,()->Validation.date("2026-02-29"));assertEquals("2024-02-29",Validation.addDays("2024-02-28",1));}
    @Test void discounts(){assertEquals(80000,CatalogService.discountedPrice(100000,20));assertEquals(0,CatalogService.discountedPrice(100000,100));assertEquals(1,CatalogService.discountedPrice(1,50));assertThrows(ApiException.class,()->CatalogService.discountedPrice(100,-1));assertThrows(ApiException.class,()->CatalogService.discountedPrice(-1,0));}
    @Test void validationRejectsObjectsAndInvalidNumbers(){assertThrows(ApiException.class,()->Validation.contact(Row.of("name",Row.of("x",1),"phone","0901234567")));assertThrows(ApiException.class,()->Validation.integer(Row.of("x",true),"x","X",0,100));assertThrows(ApiException.class,()->Validation.integer(Row.of("x",1.2),"x","X",0,100));assertEquals(30,Validation.integer(Row.of("x","30"),"x","X",1,730));}
}
