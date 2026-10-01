package vn.edu.eaut.gym.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import vn.edu.eaut.gym.model.*;
@RestControllerAdvice
public class ApiErrorHandler {
    @ExceptionHandler(ApiException.class) ResponseEntity<Row> domain(ApiException e){return ResponseEntity.status(e.status()).body(Row.of("error",e.getMessage()));}
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<Row> conflict(Exception e){return ResponseEntity.status(409).body(Row.of("error","Dữ liệu bị trùng hoặc đang được sử dụng. Kiểm tra mã, số điện thoại và bản ghi liên quan."));}
    @ExceptionHandler(HttpMessageNotReadableException.class) ResponseEntity<Row> badBody(Exception e){return ResponseEntity.badRequest().body(Row.of("error","Dữ liệu JSON không hợp lệ."));}
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class) ResponseEntity<Row> badType(Exception e){return ResponseEntity.status(415).body(Row.of("error","Yêu cầu phải là JSON."));}
    @ExceptionHandler(Exception.class) ResponseEntity<Row> unexpected(Exception e){org.slf4j.LoggerFactory.getLogger(getClass()).error("Request failed",e);return ResponseEntity.status(500).body(Row.of("error","Không xử lý được yêu cầu. Kiểm tra máy chủ và MySQL."));}
}
