package com.example.WebIntegrado.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "app", "ColdTrace API - WebIntegrado",
            "status", "OK",
            "frontend", "http://localhost:4200 (ng serve)",
            "login", "POST /api/auth/login {\"username\":\"admin\",\"password\":\"admin123\"}",
            "docs", "Ver docs/ColdTrace.postman_collection.json e INFORME-AVANCE.md"
        );
    }
}
