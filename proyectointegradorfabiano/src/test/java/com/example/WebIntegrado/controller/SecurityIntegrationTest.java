package com.example.WebIntegrado.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void sinTokenDevuelve401() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void guestPuedeConsultarPeroNoCrearProductos() throws Exception {
        String token = token("guest", "guest123");

        mockMvc.perform(get("/api/productos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/productos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson()))
                .andExpect(status().isForbidden());
    }

    @Test
    void userPuedeConsultarPeroNoEliminarProductos() throws Exception {
        String token = token("user", "user123");

        mockMvc.perform(get("/api/productos").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/productos/1").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminNoPuedeEliminarProductoConLotes() throws Exception {
        String token = token("admin", "admin123");

        mockMvc.perform(delete("/api/productos/1").header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());
    }

    private String token(String username, String password) throws Exception {
        String body = """
                {"username":"%s","password":"%s"}
                """.formatted(username, password);
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = Pattern.compile("\"token\"\\s*:\\s*\"([^\"]+)\"").matcher(response);
        if (!matcher.find()) {
            throw new IllegalStateException("La respuesta de login no incluyó token");
        }
        return matcher.group(1);
    }

    private String productoJson() {
        return """
                {"nombre":"Producto prueba seguridad","tipo":"Biologico","temperaturaMinima":2.0,"temperaturaMaxima":8.0,"vidaUtilDias":30}
                """;
    }
}
