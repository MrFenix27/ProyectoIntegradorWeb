package com.example.WebIntegrado.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    private final String frontendUrl;

    public HomeController(@Value("${app.cors.allowed-origins:http://localhost:4200}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "app", "ColdTrace API - WebIntegrado",
            "status", "OK",
            "frontend", frontendUrl,
            "health", "/actuator/health",
            "login", "POST /api/auth/login {\"username\":\"admin\",\"password\":\"admin123\"}",
            "docs", "Ver docs/ColdTrace.postman_collection.json e INFORME-AVANCE.md"
        );
    }
}
