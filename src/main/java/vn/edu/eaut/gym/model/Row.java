package vn.edu.eaut.gym.model;
import java.util.LinkedHashMap;
import java.util.Map;
/** Bản ghi JDBC giữ nguyên tên cột trong hợp đồng API của giao diện. */
public class Row extends LinkedHashMap<String,Object> {
    public Row() {}
    public Row(Map<String,?> source) { super(source); }
    public String text(String key) { Object v=get(key);return v==null?"":v.toString(); }
    public long number(String key) { Object v=get(key);return v==null?0:Long.parseLong(v.toString()); }
    public static Row of(Object... pairs) { Row r=new Row();for(int i=0;i<pairs.length;i+=2) r.put((String)pairs[i],pairs[i+1]);return r; }
}
