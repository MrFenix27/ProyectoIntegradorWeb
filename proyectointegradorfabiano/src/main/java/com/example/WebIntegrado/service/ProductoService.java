package com.example.WebIntegrado.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.WebIntegrado.exception.RecursoNoEncontradoException;
import com.example.WebIntegrado.model.Producto;
import com.example.WebIntegrado.repository.LoteRepository;
import com.example.WebIntegrado.repository.ProductoRepository;

@Service
public class ProductoService {
    private final ProductoRepository repository;
    private final LoteRepository loteRepository;

    public ProductoService(ProductoRepository repository, LoteRepository loteRepository) {
        this.repository = repository;
        this.loteRepository = loteRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Producto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarPorTipo(String tipo) {
        return repository.buscarPorTipo(tipo);
    }

    @Transactional
    public Producto registrar(Producto producto) {
        validarRango(producto);
        return repository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, Producto datos) {
        Producto producto = buscarPorId(id);
        validarRango(datos);
        producto.setNombre(datos.getNombre());
        producto.setTipo(datos.getTipo());
        producto.setTemperaturaMinima(datos.getTemperaturaMinima());
        producto.setTemperaturaMaxima(datos.getTemperaturaMaxima());
        producto.setVidaUtilDias(datos.getVidaUtilDias());
        return repository.save(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarPorId(id);
        if (loteRepository.existsByProductoId(id)) {
            throw new IllegalStateException(
                    "No se puede eliminar el producto " + id + " porque tiene lotes asociados");
        }
        repository.delete(producto);
    }

    private void validarRango(Producto producto) {
        if (producto.getTemperaturaMinima() > producto.getTemperaturaMaxima()) {
            throw new IllegalArgumentException("La temperatura minima no puede superar la maxima");
        }
    }
}
