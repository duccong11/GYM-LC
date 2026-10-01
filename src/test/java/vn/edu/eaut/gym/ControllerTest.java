package vn.edu.eaut.gym;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;
import vn.edu.eaut.gym.controller.auth.AuthController;
import vn.edu.eaut.gym.controller.ApiErrorHandler;
import vn.edu.eaut.gym.service.AuthService;
import vn.edu.eaut.gym.model.*;
class ControllerTest {
    AuthService auth;MockMvc mvc;
    @BeforeEach void init(){auth=mock(AuthService.class);mvc=MockMvcBuilders.standaloneSetup(new AuthController(auth)).setControllerAdvice(new ApiErrorHandler()).build();}
    @Test void jsonObjectRequired()throws Exception{mvc.perform(post("/api/auth").contentType("application/json").content("[]")).andExpect(status().isBadRequest());}
    @Test void unknownActionRejected()throws Exception{mvc.perform(post("/api/auth").contentType("application/json").content("{\"action\":\"unknown\"}")).andExpect(status().isBadRequest());}
    @Test void sessionMustExist()throws Exception{when(auth.authorize(any(),eq(false))).thenThrow(new ApiException("Chưa đăng nhập",401));mvc.perform(get("/api/auth")).andExpect(status().isUnauthorized());}
}
