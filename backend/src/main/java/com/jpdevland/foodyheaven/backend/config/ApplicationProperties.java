package com.jpdevland.foodyheaven.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Data
public class ApplicationProperties {
    private String jwtSecret;
    private long jwtExpiration; // in milliseconds

    private final Database db = new Database();

    @Data
    public static class Database {
        private String url;
        private String username;
        private String password;
    }
}
