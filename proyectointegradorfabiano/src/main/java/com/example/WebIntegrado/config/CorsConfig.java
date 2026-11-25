package com.example.WebIntegrado.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS para el frontend desplegado en Vercel.
 *
 * El dominio de produccion llega por la variable FRONTEND_URL y se puede
 * definir una lista separada por comas. Localhost queda siempre habilitado
 * para el desarrollo con `ng serve`.
 */
@Configuration
public class CorsConfig {

    private static final List<String> DEV_ORIGINS = List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "http://localhost:4000"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:4200}") String allowedOrigins,
            @Value("${app.cors.allow-vercel-previews:false}") boolean allowVercelPreviews) {

        List<String> originPatterns = new ArrayList<>(DEV_ORIGINS);
        Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .forEach(originPatterns::add);

        if (allowVercelPreviews) {
            originPatterns.add("https://*.vercel.app");
        }

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(originPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/actuator/health", config);
        return source;
    }
}
