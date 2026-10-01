package vn.edu.eaut.gym;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import vn.edu.eaut.gym.dao.GymDao;
import vn.edu.eaut.gym.model.*;
import vn.edu.eaut.gym.service.CatalogService;
import java.nio.file.*;
import java.util.*;

/** Direct service unit tests. The DAO is mocked; no real database is modified. */
class ReportWorkbookTest {
    static final List<Row> groups=new ArrayList<>();
    static final List<DynamicTest> tests=new ArrayList<>();
    static Row group(String name,String title,String precondition){
        Row g=Row.of("name",name,"module","src/main/java/vn/edu/eaut/gym/service/CatalogService.java","title",title,"precondition",precondition,"engine","JUnit 5 + Mockito","cases",new ArrayList<Row>());
        groups.add(g);return g;
    }
    @SuppressWarnings("unchecked")
    static void add(Row g,Row c,org.junit.jupiter.api.function.Executable run){
        c.put("pass",false);c.put("actual","Chưa chạy");((List<Row>)g.get("cases")).add(c);
        tests.add(DynamicTest.dynamicTest(c.text("title"),()->{try{run.execute();c.put("pass",true);c.put("actual",c.get("expected"));}catch(Throwable e){c.put("actual",e.toString());throw e;}}));
    }
    @TestFactory List<DynamicTest> cases(){
        Row price=group("discountedPrice","Tính giá sau khuyến mãi","Gọi trực tiếp discountedPrice(price, percent). Đơn vị giá: đồng. Làm tròn tới đồng gần nhất; 0,5 làm tròn lên.");
        long[][] values={{100000,20,80000},{100000,0,100000},{100000,100,0},{1,50,1},{0,20,0},{100000,-1,0},{100000,101,0},{-1,20,0}};
        for(long[] v:values){boolean valid=v[0]>=0&&v[1]>=0&&v[1]<=100;String error=valid?"Không có ngoại lệ":"Giá hoặc phần trăm giảm không hợp lệ.";
            add(price,Row.of("title","Giá "+v[0]+" đồng, giảm "+v[1]+"%","type",v[1]==20&&v[0]>0?"N":"B","input",Row.of("price",v[0],"percent",v[1]),"expected",valid?v[2]+" đồng":"ApiException: "+error,"error",error,"ecode",valid?"":"E1"),()->{
                if(valid)assertEquals(v[2],CatalogService.discountedPrice(v[0],(int)v[1]));
                else assertEquals(error,assertThrows(ApiException.class,()->CatalogService.discountedPrice(v[0],(int)v[1])).getMessage());
            });
        }
        Row crud=group("execute","Thêm, sửa, xóa dịch vụ","Gọi CatalogService.execute(b). GymDao là mock: tồn tại, trùng tên và lịch tương lai theo từng ca. Kiểm tra cả giá trị trả về, tham số ghi và không ghi khi lỗi; không chạy MySQL.");
        service(crud,"Thêm Gym hợp lệ",null,"Gym",1,false,false,false,"","INSERT");
        service(crud,"Thêm tên 1 ký tự",null,"G",1,false,false,false,"Tên dịch vụ phải có 2–100 ký tự.","");
        service(crud,"Thêm tên 2 ký tự",null,"GY",1,false,false,false,"","INSERT");
        service(crud,"Thêm tên trùng",null,"Gym",1,false,true,false,"Tên dịch vụ đã tồn tại, kể cả dịch vụ đã lưu trữ.","");
        service(crud,"Sửa tên dịch vụ", "S1","Yoga",1,true,false,false,"","UPDATE");
        service(crud,"Sửa dịch vụ không tồn tại","S1","Yoga",1,false,false,false,"Không tìm thấy dịch vụ.","");
        service(crud,"Ngừng dịch vụ còn lịch tương lai","S1","Gym",0,true,false,true,"Không thể ngừng dịch vụ đang có lịch sắp tới.","");
        service(crud,"Xóa mềm dịch vụ không có lịch","S1","DELETE",0,true,false,false,"","DELETE");
        service(crud,"Xóa dịch vụ còn lịch tương lai","S1","DELETE",0,true,false,true,"Dịch vụ còn lịch tập sắp tới. Hãy hủy hoặc đổi lịch trước.","");
        service(crud,"Xóa dịch vụ không tồn tại","S1","DELETE",0,false,false,false,"Không tìm thấy dịch vụ.","");
        service(crud,"Thêm dịch vụ thiếu tên",null,"",1,false,false,false,"Tên dịch vụ phải có 2–100 ký tự.","");
        service(crud,"Sửa dịch vụ thiếu tên","S1","",1,true,false,false,"Tên dịch vụ phải có 2–100 ký tự.","");
        service(crud,"Sửa dịch vụ thành tên trùng","S1","Yoga",1,true,true,false,"Tên dịch vụ đã tồn tại, kể cả dịch vụ đã lưu trữ.","");
        service(crud,"Xóa dịch vụ thiếu mã",null,"DELETE",0,false,false,false,"Thiếu dịch vụ cần xóa.","");
        return tests;
    }
    static void service(Row g,String title,String id,String name,int active,boolean exists,boolean duplicate,boolean future,String error,String write){
        boolean delete=name.equals("DELETE");Row b=Row.of("action",delete?"service.delete":"service.save","name",delete?"Gym":name,"description","","active",active);if(id!=null)b.put("id",id);
        String expected=error.isEmpty()?"ok=true; id="+(id==null?"UUID mới":id)+"; "+(write.equals("DELETE")?"UPDATE active=0, deleted=1":write+" đúng tên, mô tả, trạng thái"):"ApiException: "+error+"; không ghi dữ liệu";
        String ec=error.isEmpty()?"":error.contains("2–100")?"E1":error.contains("Tên dịch vụ đã")?"E2":error.contains("Không tìm thấy")?"E3":"E4";
        add(g,Row.of("title",title,"type",name.length()<3?"B":error.isEmpty()?"N":"A","input",Row.of("b",b,"Tồn tại",exists,"Trùng tên",duplicate,"Có lịch tương lai",future),"expected",expected,"error",error.isEmpty()?"Không có ngoại lệ":error,"ecode",ec),()->{
            GymDao db=mock(GymDao.class);
            if(id!=null)when(db.exists("SELECT id FROM services WHERE id=? AND deleted=0",id)).thenReturn(exists);
            when(db.exists(eq("SELECT id FROM schedules WHERE service_id=? AND status='ACTIVE' AND date>=?"),any(),any())).thenReturn(future);
            when(db.exists(eq("SELECT id FROM services WHERE name=? AND id<>?"),any(),any())).thenReturn(duplicate);
            CatalogService service=new CatalogService(db);
            if(!error.isEmpty()){
                assertEquals(error,assertThrows(ApiException.class,()->service.execute(b)).getMessage());
                assertTrue(mockingDetails(db).getInvocations().stream().noneMatch(x->x.getMethod().getName().equals("update")));
            }else{
                Row result=service.execute(b);assertEquals(true,result.get("ok"));String actualId=result.text("id");
                if(id!=null)assertEquals(id,actualId);else assertNotNull(UUID.fromString(actualId));
                if(delete)verify(db).update("UPDATE services SET active=0,deleted=1 WHERE id=?",actualId);
                else if(id==null)verify(db).update("INSERT INTO services(id,name,description,active) VALUES(?,?,?,?)",actualId,name,"",active);
                else verify(db).update("UPDATE services SET name=?,description=?,active=? WHERE id=?",name,"",active,actualId);
            }
        });
    }
    @AfterAll static void export()throws Exception{
        Path dir=Path.of("outputs/gym-report-unit");Files.createDirectories(dir);
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(dir.resolve("java-cases.json").toFile(),groups);
    }
}
