package vn.edu.eaut.gym.dao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import vn.edu.eaut.gym.model.Row;
import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.function.Supplier;

@Repository
public class GymDao {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    public GymDao(JdbcTemplate jdbc,PlatformTransactionManager manager) { this.jdbc=jdbc;tx=new TransactionTemplate(manager); }
    public <T> T transaction(boolean write,Supplier<T> work) {
        return tx.execute(status->{ if(write) rows("SELECT id FROM mutation_lock WHERE id=1 FOR UPDATE"); return work.get(); });
    }
    public List<Row> rows(String sql,Object... args) {
        return jdbc.query(sql,(rs,n)->{
            Row row=new Row(); ResultSetMetaData m=rs.getMetaData();
            for(int i=1;i<=m.getColumnCount();i++) {
                Object value=rs.getObject(i);String key=m.getColumnLabel(i);
                if(value instanceof Timestamp t) value=t.toLocalDateTime().toInstant(ZoneOffset.UTC).toString();
                else if(value instanceof LocalDateTime t) value=t.toInstant(ZoneOffset.UTC).toString();
                else if(value instanceof LocalDate d) value=d.toString();
                else if(value instanceof java.sql.Date d) value=d.toLocalDate().toString();
                else if(value instanceof Time t) value=t.toLocalTime().toString();
                else if(value instanceof Boolean b) value=b?1:0;
                if(value==null && Set.of("birth_date","requested_start").contains(key)) value="";
                row.put(key,value);
            }
            if(row.containsKey("legacy_closed") && row.number("legacy_closed")!=0) row.put("checkout_at","legacy");
            return row;
        },args);
    }
    public Row one(String sql,Object... args) { var r=rows(sql,args);return r.isEmpty()?null:r.get(0); }
    public boolean exists(String sql,Object... args) { return one(sql,args)!=null; }
    public int update(String sql,Object... args) { return jdbc.update(sql,args); }
    public static String now() { return LocalDateTime.now(ZoneOffset.UTC).toString().replace('T',' '); }
    public void audit(String actor,String action,String id) { update("INSERT INTO audit_logs(id,actor_id,action,entity_id,created_at) VALUES(?,?,?,?,?)",UUID.randomUUID().toString(),actor,action,id,now()); }
}
