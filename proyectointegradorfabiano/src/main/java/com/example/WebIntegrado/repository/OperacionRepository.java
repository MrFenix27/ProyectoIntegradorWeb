package com.example.WebIntegrado.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.WebIntegrado.model.Operacion;

public interface OperacionRepository extends JpaRepository<Operacion, Long> {
    List<Operacion> findByEstado(String estado);

    // JPQL: filtrar por estado
    @Query("SELECT o FROM Operacion o WHERE o.estado = :estado")
    List<Operacion> buscarPorEstado(@Param("estado") String estado);

    // JPQL: filtrar por rango de fechas
    @Query("SELECT o FROM Operacion o WHERE o.fechaRegistro BETWEEN :desde AND :hasta")
    List<Operacion> buscarPorRangoFechas(@Param("desde") LocalDateTime desde,
                                         @Param("hasta") LocalDateTime hasta);

    // JPQL: buscar por transportista
    @Query("SELECT o FROM Operacion o WHERE o.transportista = :transportista")
    List<Operacion> buscarPorTransportista(@Param("transportista") String transportista);
}
