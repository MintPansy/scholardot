package swyp.scholardot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class ScholardotApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScholardotApplication.class, args);
	}

}
