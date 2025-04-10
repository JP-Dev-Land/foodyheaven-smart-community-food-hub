package com.jpdevland.foodyheaven.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

import com.jpdevland.foodyheaven.backend.config.ApplicationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ApplicationProperties.class)
public class FoodyHeavenApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodyHeavenApplication.class, args);
    }

}
