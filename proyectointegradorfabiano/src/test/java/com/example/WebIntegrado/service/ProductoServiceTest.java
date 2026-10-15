package com.example.WebIntegrado.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.WebIntegrado.model.Producto;
import com.example.WebIntegrado.repository.ProductoRepository;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repository;

    @InjectMocks
    private ProductoService service;

    @Test
    void registraProductoValido() {
        Producto producto = new Producto("Vacuna", "Biologico", 2.0, 8.0, 90);
        when(repository.save(producto)).thenReturn(producto);

        Producto resultado = service.registrar(producto);

        assertEquals("Vacuna", resultado.getNombre());
        verify(repository).save(producto);
    }

    @Test
    void rechazaRangoDeTemperaturaInvalido() {
        Producto producto = new Producto("Vacuna", "Biologico", 8.0, 2.0, 90);

        assertThrows(IllegalArgumentException.class, () -> service.registrar(producto));
    }
}
