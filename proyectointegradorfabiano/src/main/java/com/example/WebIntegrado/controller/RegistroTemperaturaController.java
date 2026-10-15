package com.example.WebIntegrado.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.WebIntegrado.model.RegistroTemperatura;
import com.example.WebIntegrado.service.RegistroTemperaturaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lotes/{loteId}/temperaturas")
public class RegistroTemperaturaController {
    private final RegistroTemperaturaService service;

    public RegistroTemperaturaController(RegistroTemperaturaService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public List<RegistroTemperatura> listar(@PathVariable Long loteId) {
        return service.listarPorLote(loteId);
    }

    @GetMapping("/alertas")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public List<RegistroTemperatura> alertas(@PathVariable Long loteId) {
        return service.buscarAlertasPorLote(loteId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public RegistroTemperatura registrar(@PathVariable Long loteId,
                                         @Valid @RequestBody RegistroTemperatura registro) {
        return service.registrar(loteId, registro);
    }
}
