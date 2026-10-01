package vn.edu.eaut.gym.tool;
import vn.edu.eaut.gym.util.Passwords;
import java.sql.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
/** Explicit fresh-database setup. Never resets an existing database. */
public final class DatabaseSetup {
    private DatabaseSetup() {}
    private static String env(String name,String fallback){return System.getenv().getOrDefault(name,System.getProperty(name,fallback));}
    public static void initialize(boolean demo)throws Exception{
        String name=env("DB_NAME","quan_ly_phong_gym");if(!name.matches("[a-zA-Z0-9_]+"))throw new IllegalArgumentException("DB_NAME không hợp lệ.");
        String url="jdbc:mysql://"+env("DB_HOST","127.0.0.1")+":"+env("DB_PORT","3306")+"/?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true&characterEncoding=UTF-8";
        try(Connection c=DriverManager.getConnection(url,env("DB_USER","root"),env("DB_PASSWORD",""))){
            try(Statement create=c.createStatement()){create.execute("CREATE DATABASE IF NOT EXISTS `"+name+"` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");}
            c.setCatalog(name);
            try(Statement st=c.createStatement()){
            try(ResultSet rs=st.executeQuery("SHOW TABLES")){if(rs.next())throw new IllegalStateException("Database đã có bảng. Không khởi tạo lại để bảo vệ dữ liệu hiện có.");}
            try(var stream=DatabaseSetup.class.getResourceAsStream("/db/schema.sql")){
                if(stream==null)throw new IllegalStateException("Thiếu db/schema.sql");
                String sql=new String(stream.readAllBytes(),StandardCharsets.UTF_8).replaceAll("(?m)^--.*$","");
                for(String part:sql.split(";"))if(!part.isBlank())st.execute(part.trim());
            }
            st.executeUpdate("INSERT INTO mutation_lock VALUES(1)");
            st.executeUpdate("INSERT INTO roles(code,name) VALUES('ADMIN','Quản trị hệ thống'),('MANAGER','Quản lý phòng GYM'),('STAFF','Nhân viên'),('TRAINER','Huấn luyện viên'),('MEMBER','Hội viên')");
            st.executeUpdate("INSERT INTO system_settings VALUES(1,'GYM LC','05:00–22:00')");
            if(demo)seed(c);
            System.out.println("Đã khởi tạo database "+name+(demo?" và tài khoản minh họa.":". Thêm tài khoản quản trị trước khi sử dụng."));
            }
        }
    }
    private static void execute(Connection c,String sql,Object...args)throws SQLException{try(PreparedStatement p=c.prepareStatement(sql)){for(int i=0;i<args.length;i++)p.setObject(i+1,args[i]);p.executeUpdate();}}
    private static void seed(Connection c)throws SQLException{
        execute(c,"INSERT INTO services(id,name,description,active) VALUES('demo-gym','Gym','Tập thể hình',1),('demo-yoga','Yoga','Tập Yoga',1),('demo-boxing','Boxing','Tập Boxing',1)");
        execute(c,"INSERT INTO trainers(id,name,phone,email,specialty,experience,schedule,active,code) VALUES('demo-trainer','HLV Minh','0901000001','coach@example.com','Gym, Yoga',5,'06:00–20:00',1,'HLV00001')");
        execute(c,"INSERT INTO trainer_services VALUES('demo-trainer','demo-gym'),('demo-trainer','demo-yoga')");
        execute(c,"INSERT INTO members(id,name,phone,email,gender,created_at,code) VALUES('demo-member','Hội viên An','0901000002','member@example.com','Nam',UTC_TIMESTAMP(3),'HV00001')");
        execute(c,"INSERT INTO plans(id,name,days,price,description,code) VALUES('demo-plan','Gói một tháng',30,350000,'Tập tự do','GT001')");
        execute(c,"INSERT INTO rooms(id,name,type,capacity,description,active) VALUES('demo-room','Phòng Gym','Gym',30,'Tầng 1',1)");
        String[][] users={{"admin","ADMIN","GymAdmin2026!"},{"manager","MANAGER","GymManager2026!"},{"staff1","STAFF","GymStaff2026!"},{"coach1","TRAINER","GymCoach2026!"},{"member1","MEMBER","GymMember2026!"}};
        for(String[] user:users)execute(c,"INSERT INTO accounts(id,name,username,password_hash,phone,role,active,created_at,member_id,trainer_id) VALUES(?,?,?,?,?, ?,1,UTC_TIMESTAMP(3),?,?)","demo-"+user[0],user[0],user[0],Passwords.hash(user[2]),"0901000099",user[1],user[1].equals("MEMBER")?"demo-member":null,user[1].equals("TRAINER")?"demo-trainer":null);
    }
}
