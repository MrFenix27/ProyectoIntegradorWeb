package com.example.WebIntegrado.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.WebIntegrado.model.Producto;
import com.example.WebIntegrado.repository.LoteRepository;
import com.example.WebIntegrado.repository.ProductoRepository;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository repository;

    @Mock
    private LoteRepository loteRepository;

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

    @Test
    void rechazaEliminarProductoConLotes() {
        Producto producto = new Producto("Vacuna", "Biologico", 2.0, 8.0, 90);
        when(repository.findById(1L)).thenReturn(Optional.of(producto));
        when(loteRepository.existsByProductoId(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> service.eliminar(1L));

        verify(repository, never()).delete(any(Producto.class));
    }
}
