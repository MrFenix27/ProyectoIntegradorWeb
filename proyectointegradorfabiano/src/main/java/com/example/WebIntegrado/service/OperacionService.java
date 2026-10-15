package com.example.WebIntegrado.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.WebIntegrado.dto.RecepcionRequest;
import com.example.WebIntegrado.exception.RecursoNoEncontradoException;
import com.example.WebIntegrado.model.Operacion;
import com.example.WebIntegrado.repository.OperacionRepository;

@Service
public class OperacionService {
    private final OperacionRepository repository;

    public OperacionService(OperacionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Operacion> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Operacion> listarEnTransito() {
        return repository.buscarPorEstado("EN_TRANSITO");
    }

    @Transactional(readOnly = true)
    public List<Operacion> buscarPorRangoFechas(LocalDateTime desde, LocalDateTime hasta) {
        return repository.buscarPorRangoFechas(desde, hasta);
    }

    @Transactional
    public Operacion registrar(Operacion operacion) {
        if (operacion.getEstado() == null) {
            operacion.setEstado("EN_TRANSITO");
        }
        operacion.setFechaRegistro(LocalDateTime.now());
        return repository.save(operacion);
    }

    @Transactional
    public Operacion registrarRecepcion(Long id, RecepcionRequest solicitud) {
        Operacion operacion = repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Operación no encontrada: " + id));
        if (!"EN_TRANSITO".equals(operacion.getEstado())) {
            throw new IllegalStateException("El despacho " + operacion.getManifiesto() + " ya fue recepcionado");
        }

        operacion.setEstado("RECEPCIONADO");
        List<String> controles = new ArrayList<>(operacion.getControlesConfirmados() != null
                ? operacion.getControlesConfirmados() : List.of());
        controles.add("Temperatura de llegada: " + solicitud.getTemperatura() + "°C");
        if (solicitud.getLogger() != null) {
            controles.add("Datalogger: " + solicitud.getLogger());
        }
        if (solicitud.getSello() != null) {
            controles.add("Sellos intactos: " + solicitud.getSello());
        }
        if (solicitud.getDano() != null) {
            controles.add("Sin daños: " + solicitud.getDano());
        }
        operacion.setControlesConfirmados(controles);
        if (solicitud.getFirma() != null) {
            operacion.setFirma(solicitud.getFirma());
        }
        return repository.save(operacion);
    }
}
