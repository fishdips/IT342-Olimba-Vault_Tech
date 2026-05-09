package edu.cit.olimba.vaulttech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VaulttechApplication {

	public static void main(String[] args) {
		SpringApplication.run(VaulttechApplication.class, args);
	}

}