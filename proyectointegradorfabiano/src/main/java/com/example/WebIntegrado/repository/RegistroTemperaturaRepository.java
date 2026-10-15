package com.example.WebIntegrado.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.WebIntegrado.model.RegistroTemperatura;

public interface RegistroTemperaturaRepository extends JpaRepository<RegistroTemperatura, Long> {
    List<RegistroTemperatura> findByLoteIdOrderByFechaRegistroDesc(Long loteId);

    // JPQL: filtrar por rango de fechas
    @Query("SELECT r FROM RegistroTemperatura r WHERE r.lote.id = :loteId AND r.fechaRegistro BETWEEN :desde AND :hasta ORDER BY r.fechaRegistro DESC")
    List<RegistroTemperatura> buscarPorLoteYFechas(@Param("loteId") Long loteId,
                                                   @Param("desde") LocalDateTime desde,
                                                   @Param("hasta") LocalDateTime hasta);

    // JPQL: alertas fuera de rango para un lote
    @Query("SELECT r FROM RegistroTemperatura r JOIN r.lote l JOIN l.producto p " +
           "WHERE r.lote.id = :loteId AND (r.temperatura < p.temperaturaMinima OR r.temperatura > p.temperaturaMaxima)")
    List<RegistroTemperatura> buscarAlertasPorLote(@Param("loteId") Long loteId);
}
