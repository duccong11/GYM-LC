package vn.edu.eaut.gym.config;

import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

/** Đọc .env cục bộ; biến môi trường của hệ điều hành có độ ưu tiên cao hơn. */
public final class LocalEnvironment {
    private LocalEnvironment() {}
    public static void load() {
        boolean test = "1".equals(System.getenv("GYM_TEST_MODE"));
        Path file = Path.of(test ? ".env.test" : ".env");
        if (Files.isRegularFile(file)) {
            try {
                for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                    line=line.trim();
                    if(line.isBlank() || line.startsWith("#") || !line.contains("=")) continue;
                    int i=line.indexOf('='); String key=line.substring(0,i).trim(), value=line.substring(i+1).trim();
                    if(value.length()>=2 && ((value.startsWith("\"")&&value.endsWith("\""))||(value.startsWith("'")&&value.endsWith("'")))) value=value.substring(1,value.length()-1);
                    if(System.getenv(key)==null && System.getProperty(key)==null) System.setProperty(key,value);
                }
            } catch(IOException e) { throw new IllegalStateException("Không đọc được cấu hình .env",e); }
        }
        String db=System.getenv().getOrDefault("DB_NAME",System.getProperty("DB_NAME","quan_ly_phong_gym"));
        if(!db.matches("[a-zA-Z0-9_]+") || (test&&!db.matches(".*_(test|migration_check|sql_check)$"))) throw new IllegalStateException("Tên database không an toàn cho chế độ chạy.");
    }
}
