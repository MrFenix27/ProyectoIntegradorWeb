package com.example.WebIntegrado.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.WebIntegrado.model.Producto;
import com.example.WebIntegrado.service.ProductoService;

@ExtendWith(MockitoExtension.class)
class ProductoControllerTest {

    @Mock
    private ProductoService service;

    private MockMvc mockMvc;

    @BeforeEach
    void configurarControlador() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProductoController(service)).build();
    }

    @Test
    void listaProductosConRespuestaOk() throws Exception {
        when(service.listar()).thenReturn(List.of(new Producto("Vacuna", "Biologico", 2.0, 8.0, 90)));

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Vacuna"));
    }
}
