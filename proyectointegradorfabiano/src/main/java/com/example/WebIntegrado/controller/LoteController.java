package com.example.WebIntegrado.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.WebIntegrado.model.Lote;
import com.example.WebIntegrado.service.LoteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {
    private final LoteService service;

    public LoteController(LoteService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public List<Lote> listar(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            return service.buscarPorEstado(estado);
        }
        return service.listar();
    }

    @GetMapping("/vencidos")
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public List<Lote> vencidos(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate antesDe) {
        return service.buscarVencidosAntesDe(antesDe);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER','GUEST')")
    public Lote buscar(@PathVariable Long id) { return service.buscarPorId(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Lote registrar(@Valid @RequestBody Lote lote) { return service.registrar(lote); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Lote actualizar(@PathVariable Long id, @Valid @RequestBody Lote lote) {
        return service.actualizar(id, lote);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) { service.eliminar(id); }
}
