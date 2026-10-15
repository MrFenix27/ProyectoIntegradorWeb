package com.example.WebIntegrado.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.WebIntegrado.model.Operacion;
import com.example.WebIntegrado.repository.OperacionRepository;

@ExtendWith(MockitoExtension.class)
class OperacionServiceTest {

    @Mock
    private OperacionRepository repository;

    @InjectMocks
    private OperacionService service;

    @Test
    void registraOperacionYAsignaFecha() {
        Operacion operacion = new Operacion("MF-2026-001", "TransCold", "Vacunas",
                List.of("Integridad del Sello"), "Ana Torres", "firma-demo", "foto.jpg");
        when(repository.save(operacion)).thenReturn(operacion);

        Operacion resultado = service.registrar(operacion);

        assertSame(operacion, resultado);
        assertNotNull(resultado.getFechaRegistro());
        verify(repository).save(operacion);
    }
}
