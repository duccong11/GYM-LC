package vn.edu.eaut.gym.util;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
public final class Passwords {
    private Passwords() {}
    public static String token() { byte[] b=new byte[32];new SecureRandom().nextBytes(b);return HexFormat.of().formatHex(b); }
    public static String digest(String value) {try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    public static String hash(String password) {return hash(password,token());}
    public static String hash(String password,String salt) {
        try { var spec=new PBEKeySpec(password.toCharArray(),salt.getBytes(StandardCharsets.UTF_8),100000,256);
            return "pbkdf2:100000:"+salt+":"+HexFormat.of().formatHex(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded());
        }catch(Exception e){throw new IllegalStateException(e);}
    }
    public static boolean verify(String password,String stored) {
        String[] p=stored.split(":");if(p.length!=4||!p[0].equals("pbkdf2")||!p[1].equals("100000"))return false;
        return MessageDigest.isEqual(hash(password,p[2]).getBytes(StandardCharsets.UTF_8),stored.getBytes(StandardCharsets.UTF_8));
    }
}
