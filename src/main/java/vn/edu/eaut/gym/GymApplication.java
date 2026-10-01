package vn.edu.eaut.gym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import vn.edu.eaut.gym.config.LocalEnvironment;

@SpringBootApplication
public class GymApplication {
    public static void main(String[] args) throws Exception {
        LocalEnvironment.load();
        if(java.util.Arrays.asList(args).contains("--setup")) {
            vn.edu.eaut.gym.tool.DatabaseSetup.initialize(java.util.Arrays.asList(args).contains("--demo"));
            return;
        }
        SpringApplication.run(GymApplication.class, args);
    }
}
