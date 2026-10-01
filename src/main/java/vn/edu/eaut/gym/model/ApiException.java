package vn.edu.eaut.gym.model;
public class ApiException extends RuntimeException {
    private final int status;
    public ApiException(String message) { this(message,400); }
    public ApiException(String message,int status) { super(message);this.status=status; }
    public int status() { return status; }
}
