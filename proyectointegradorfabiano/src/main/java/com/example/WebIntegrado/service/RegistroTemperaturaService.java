package com.example.WebIntegrado.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.WebIntegrado.exception.RecursoNoEncontradoException;
import com.example.WebIntegrado.model.Lote;
import com.example.WebIntegrado.model.RegistroTemperatura;
import com.example.WebIntegrado.repository.LoteRepository;
import com.example.WebIntegrado.repository.RegistroTemperaturaRepository;

@Service
public class RegistroTemperaturaService {
    private final RegistroTemperaturaRepository registroRepository;
    private final LoteRepository loteRepository;

    public RegistroTemperaturaService(RegistroTemperaturaRepository registroRepository, LoteRepository loteRepository) {
        this.registroRepository = registroRepository;
        this.loteRepository = loteRepository;
    }

    @Transactional(readOnly = true)
    public List<RegistroTemperatura> listarPorLote(Long loteId) {
        verificarLote(loteId);
        return registroRepository.findByLoteIdOrderByFechaRegistroDesc(loteId);
    }

    @Transactional(readOnly = true)
    public List<RegistroTemperatura> buscarAlertasPorLote(Long loteId) {
        verificarLote(loteId);
        return registroRepository.buscarAlertasPorLote(loteId);
    }

    @Transactional
    public RegistroTemperatura registrar(Long loteId, RegistroTemperatura registro) {
        Lote lote = verificarLote(loteId);
        registro.setLote(lote);
        if (registro.getFechaRegistro() == null) {
            registro.setFechaRegistro(LocalDateTime.now());
        }
        return registroRepository.save(registro);
    }

    private Lote verificarLote(Long loteId) {
        return loteRepository.findById(loteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lote no encontrado: " + loteId));
    }
}
