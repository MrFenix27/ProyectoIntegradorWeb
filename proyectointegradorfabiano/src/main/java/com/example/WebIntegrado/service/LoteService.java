package com.example.WebIntegrado.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.WebIntegrado.exception.RecursoNoEncontradoException;
import com.example.WebIntegrado.model.Lote;
import com.example.WebIntegrado.repository.LoteRepository;
import com.example.WebIntegrado.repository.ProductoRepository;

@Service
public class LoteService {
    private final LoteRepository loteRepository;
    private final ProductoRepository productoRepository;

    public LoteService(LoteRepository loteRepository, ProductoRepository productoRepository) {
        this.loteRepository = loteRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<Lote> listar() { return loteRepository.findAll(); }

    @Transactional(readOnly = true)
    public Lote buscarPorId(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lote no encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Lote> buscarPorEstado(String estado) {
        return loteRepository.buscarPorEstado(estado);
    }

    @Transactional(readOnly = true)
    public List<Lote> buscarVencidosAntesDe(LocalDate fecha) {
        return loteRepository.buscarVencidosAntesDe(fecha);
    }

    @Transactional
    public Lote registrar(Lote lote) {
        Long productoId = lote.getProducto().getId();
        lote.setProducto(productoRepository.findById(productoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + productoId)));
        return loteRepository.save(lote);
    }

    @Transactional
    public Lote actualizar(Long id, Lote datos) {
        Lote lote = buscarPorId(id);
        lote.setCodigo(datos.getCodigo());
        lote.setFechaVencimiento(datos.getFechaVencimiento());
        lote.setEstado(datos.getEstado());
        if (datos.getProducto() != null && datos.getProducto().getId() != null) {
            Long productoId = datos.getProducto().getId();
            lote.setProducto(productoRepository.findById(productoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + productoId)));
        }
        return loteRepository.save(lote);
    }

    @Transactional
    public void eliminar(Long id) { loteRepository.delete(buscarPorId(id)); }
}
