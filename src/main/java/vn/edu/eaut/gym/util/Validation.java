package vn.edu.eaut.gym.util;
import vn.edu.eaut.gym.model.*;
import java.time.*;
import java.util.*;
public final class Validation {
    private Validation() {}
    public static String today() { return LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).toString(); }
    public static String addDays(String s,long days) { return LocalDate.parse(s).plusDays(days).toString(); }
    public static String text(Map<String,?> b,String key,String label,int min,int max) {
        Object raw=b.get(key);if(raw==null)raw="";
        if(!(raw instanceof String)) throw new ApiException(label+" không đúng kiểu dữ liệu.");
        String s=((String)raw).trim();if(s.length()<min||s.length()>max) throw new ApiException(label+" phải có "+min+"–"+max+" ký tự.");return s;
    }
    public static int integer(Map<String,?> b,String key,String label,int min,int max) {
        Object v=b.get(key);
        try { if(v==null||v instanceof Boolean||v.toString().isBlank())throw new NumberFormatException();
            double n=Double.parseDouble(v.toString());if(!Double.isFinite(n)||n!=Math.floor(n)||n<min||n>max)throw new NumberFormatException();return (int)n;
        }catch(NumberFormatException e){throw new ApiException(label+" phải là số nguyên từ "+min+" đến "+max+".");}
    }
    public static String date(Object value) {
        if(!(value instanceof String s) || !s.matches("\\d{4}-\\d{2}-\\d{2}")) throw new ApiException("Ngày không hợp lệ.");
        try { LocalDate.parse(s);return s; }catch(Exception e){throw new ApiException("Ngày không hợp lệ.");}
    }
    public static Row contact(Map<String,?> b) {
        String name=text(b,"name","Họ tên",2,100),phone=text(b,"phone","Số điện thoại",10,11),email=text(b,"email","Email",0,100);
        if(!phone.matches("0\\d{9,10}"))throw new ApiException("Số điện thoại phải có 10–11 chữ số bắt đầu bằng 0.");
        if(!email.isEmpty()&&!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))throw new ApiException("Email không hợp lệ.");
        return Row.of("name",name,"phone",phone,"email",email);
    }
    public static String password(Object value) {
        if(!(value instanceof String s)||s.length()<8||s.length()>64||!s.matches("(?s).*[A-Za-z].*")||!s.matches("(?s).*[0-9].*"))throw new ApiException("Mật khẩu cần 8–64 ký tự, gồm chữ và số.");return s;
    }
    public static Row registrationDates(Object start,int days,String today) {
        String s=date(start);if(s.compareTo(today)<0||s.compareTo(addDays(today,730))>0)throw new ApiException("Ngày bắt đầu phải từ hôm nay đến 730 ngày tới.");
        if(days<1||days>730)throw new ApiException("Thời hạn không hợp lệ.");return Row.of("start",s,"end",addDays(s,days-1));
    }
    public static void require(boolean condition,String message) { if(!condition)throw new ApiException(message); }
    public static void require(boolean condition,String message,int status) { if(!condition)throw new ApiException(message,status); }
}
