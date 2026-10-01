package vn.edu.eaut.gym.filter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
        res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Referrer-Policy","same-origin");
        if(req.getRequestURI().startsWith("/api/")&&req.getContentLengthLong()>16384){res.setStatus(413);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"error\":\"Dữ liệu quá lớn.\"}");return;}
        chain.doFilter(req,res);
    }
}
