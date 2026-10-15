package com.example.WebIntegrado.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.WebIntegrado.dto.RecepcionRequest;
import com.example.WebIntegrado.model.Operacion;
import com.example.WebIntegrado.service.OperacionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/operaciones")
public class OperacionController {
    private final OperacionService service;

    public OperacionController(OperacionService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public List<Operacion> listar() {
        return service.listar();
    }

    @GetMapping("/en-transito")
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public List<Operacion> listarEnTransito() {
        return service.listarEnTransito();
    }

    @GetMapping("/por-fechas")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public List<Operacion> porFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return service.buscarPorRangoFechas(desde, hasta);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Operacion registrar(@Valid @RequestBody Operacion operacion) {
        return service.registrar(operacion);
    }

    @PutMapping("/{id}/recepcion")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Operacion registrarRecepcion(@PathVariable Long id,
                                        @Valid @RequestBody RecepcionRequest solicitud) {
        return service.registrarRecepcion(id, solicitud);
    }
}
