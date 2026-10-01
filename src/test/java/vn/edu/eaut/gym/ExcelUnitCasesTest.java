package vn.edu.eaut.gym;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.util.*;
import vn.edu.eaut.gym.service.CatalogService;
import java.nio.file.*;
import java.util.*;
import java.util.function.Supplier;

/** Unit cases for the submitted workbook; no HTTP server or MySQL is involved. */
class ExcelUnitCasesTest {
    static final List<Row> groups=new ArrayList<>();
    static final List<DynamicTest> tests=new ArrayList<>();
    static final ObjectMapper json=new ObjectMapper();
    static Row group(String name,String file,String title,String precondition) {
        Row g=Row.of("name",name,"module","src/main/java/vn/edu/eaut/gym/"+file,"title",title,"precondition",precondition,"cases",new ArrayList<Row>());
        groups.add(g);return g;
    }
    @SuppressWarnings("unchecked")
    static void add(Row g,String title,String type,Row input,Object expected,String error,String code,Supplier<Object> call) {
        Row c=Row.of("title",title,"type",type,"input",input,"expected",error.isEmpty()?display(expected):"Không trả về; ném ApiException","error",error.isEmpty()?"Không có ngoại lệ":error,"ecode",code,"pass",false);
        ((List<Row>)g.get("cases")).add(c);
        tests.add(DynamicTest.dynamicTest(g.text("name")+": "+title,()->{
            Object actual=null;String actualError="";
            try {actual=call.get();}catch(ApiException e){actualError=e.getMessage();}
            c.put("actual",actualError.isEmpty()?display(actual):"ApiException: "+actualError);
            assertEquals(error,actualError);
            if(error.isEmpty())assertEquals(expected,actual);
            c.put("pass",true);
        }));
    }
    static String display(Object value){try{return value instanceof String?(String)value:json.writeValueAsString(value);}catch(Exception e){throw new RuntimeException(e);}}
    @TestFactory List<DynamicTest> cases(){
        Row g=group("contact","util/Validation.java","Kiểm tra và chuẩn hóa thông tin hội viên","Gọi trực tiếp Validation.contact(b); không cần đăng nhập hoặc MySQL.");
        for(int len:new int[]{1,2,100,101}){
            Row input=Row.of("name","A".repeat(len),"phone","0901234567","email","an@example.com");boolean valid=len>=2&&len<=100;
            add(g,"Họ tên có "+len+" ký tự","B",input,valid?new Row(input):null,valid?"":"Họ tên phải có 2–100 ký tự.",valid?"":"E1",()->Validation.contact(input));
        }
        Row trim=Row.of("name","  Nguyễn An  ","phone","0901234567","email","");
        add(g,"Loại khoảng trắng ở hai đầu tên; email được để trống","N",trim,Row.of("name","Nguyễn An","phone","0901234567","email",""),"","",()->Validation.contact(trim));
        for(String phone:List.of("090123456","09012345678","1901234567")){
            Row in=Row.of("name","Nguyễn An","phone",phone,"email","");String err=phone.length()==9?"Số điện thoại phải có 10–11 ký tự.":phone.startsWith("1")?"Số điện thoại phải có 10–11 chữ số bắt đầu bằng 0.":"";
            add(g,"SĐT: "+phone,phone.length()!=10?"B":"A",in,err.isEmpty()?new Row(in):null,err,err.isEmpty()?"":"E2",()->Validation.contact(in));
        }
        Row badMail=Row.of("name","Nguyễn An","phone","0901234567","email","an@");
        add(g,"Email thiếu tên miền","A",badMail,null,"Email không hợp lệ.","E3",()->Validation.contact(badMail));

        g=group("registrationDates","util/Validation.java","Tính thời hạn đăng ký gói tập","Cố định tham số today = 2026-10-01; ngày kết thúc tính cả ngày bắt đầu.");
        String today="2026-10-01";
        for(int days:new int[]{0,1,2,729,730,731}){
            int d=days;boolean valid=d>=1&&d<=730;Row expected=valid?Row.of("start",today,"end",java.time.LocalDate.of(2026,10,1).plusDays(d-1).toString()):null;
            add(g,"Thời hạn "+d+" ngày","B",Row.of("start",today,"days",d,"today",today),expected,valid?"":"Thời hạn không hợp lệ.",valid?"":"E2",()->Validation.registrationDates(today,d,today));
        }
        for(String start:List.of("2026-09-30","2028-09-30","2028-10-01","2026-02-30")){
            boolean valid=start.equals("2028-09-30");String err=valid?"":start.equals("2026-02-30")?"Ngày không hợp lệ.":"Ngày bắt đầu phải từ hôm nay đến 730 ngày tới.";
            add(g,"Ngày bắt đầu "+start,start.equals("2026-02-30")?"A":"B",Row.of("start",start,"days",1,"today",today),valid?Row.of("start",start,"end",start):null,err,valid?"":start.equals("2026-02-30")?"E3":"E1",()->Validation.registrationDates(start,1,today));
        }

        g=group("discountedPrice","service/CatalogService.java","Tính giá gói tập sau khuyến mãi","Gọi CatalogService.discountedPrice(price, percent); giá là long, phần trăm là int.");
        long[][] discounts={{100000,20,80000},{100000,0,100000},{100000,100,0},{100000,1,99000},{100000,99,1000},{1,50,1},{0,20,0},{100000,-1,0},{100000,101,0},{-1,20,0}};
        for(long[] v:discounts){boolean valid=v[0]>=0&&v[1]>=0&&v[1]<=100;add(g,"Giá "+v[0]+", giảm "+v[1]+"%",v[1]==20&&v[0]>0?"N":"B",Row.of("price",v[0],"percent",v[1]),valid?v[2]:null,valid?"":"Giá hoặc phần trăm giảm không hợp lệ.",valid?"":"E1",()->CatalogService.discountedPrice(v[0],(int)v[1]));}

        g=group("password","util/Validation.java","Kiểm tra quy tắc mật khẩu","Gọi Validation.password(value); chỉ dùng chuỗi mật khẩu giả lập trong bộ test.");
        for(int len:new int[]{7,8,9,63,64,65}){
            String value="A".repeat(len-1)+"1";boolean valid=len>=8&&len<=64;
            add(g,"Mật khẩu dài "+len+" ký tự","B",Row.of("value",value),valid?value:null,valid?"":"Mật khẩu cần 8–64 ký tự, gồm chữ và số.",valid?"":"E1",()->Validation.password(value));
        }
        for(Object value:Arrays.asList("abcdefgh","12345678","",null))add(g,value==null?"Giá trị null":value.toString().isEmpty()?"Chuỗi rỗng":"Thiếu chữ hoặc số: "+value,"A",Row.of("value",value),null,"Mật khẩu cần 8–64 ký tự, gồm chữ và số.","E1",()->Validation.password(value));

        g=group("verify","util/Passwords.java","Đối chiếu mật khẩu với chuỗi băm","H1 = Passwords.hash(\"GymTest2026!\", \"unit-test-salt\"); H2 = Passwords.hash(\"MậtKhẩu2026!\", \"unit-test-salt\"). Đây là dữ liệu giả lập.");
        String h1=Passwords.hash("GymTest2026!","unit-test-salt"),h2=Passwords.hash("MậtKhẩu2026!","unit-test-salt");
        add(g,"Mật khẩu khớp H1","N",Row.of("password","GymTest2026!","stored","H1"),true,"","",()->Passwords.verify("GymTest2026!",h1));
        add(g,"Mật khẩu khác H1","A",Row.of("password","Wrong2026!","stored","H1"),false,"","",()->Passwords.verify("Wrong2026!",h1));
        add(g,"Mật khẩu rỗng","A",Row.of("password","","stored","H1"),false,"","",()->Passwords.verify("",h1));
        add(g,"Chuỗi băm sai định dạng","A",Row.of("password","GymTest2026!","stored","invalid-hash"),false,"","",()->Passwords.verify("GymTest2026!","invalid-hash"));
        add(g,"Mật khẩu Unicode khớp H2","N",Row.of("password","MậtKhẩu2026!","stored","H2"),true,"","",()->Passwords.verify("MậtKhẩu2026!",h2));

        g=group("write","util/Permissions.java","Kiểm tra quyền thực hiện thao tác theo vai trò","Gọi Permissions.write(role, action); không gửi HTTP và không cần tài khoản đăng nhập.");
        Object[][] rights={{"ADMIN","user.save",true},{"ADMIN","member.save",false},{"MANAGER","promotion.save",true},{"MANAGER","user.save",false},{"STAFF","member.save",true},{"STAFF","plan.save",false},{"TRAINER","schedule.save",false},{"MEMBER","payment.create",false},{"UNKNOWN","user.save",false},{"MANAGER","unknown.action",false}};
        for(Object[] v:rights)add(g,v[0]+" / "+v[1],(boolean)v[2]?"N":"A",Row.of("role",v[0],"action",v[1]),v[2],"","",()->Permissions.write((String)v[0],(String)v[1]));
        return tests;
    }
    @AfterAll static void export()throws Exception{
        Path dir=Path.of("outputs/gym-unit-feedback");Files.createDirectories(dir);
        json.writerWithDefaultPrettyPrinter().writeValue(dir.resolve("cases.json").toFile(),groups);
    }
}
