package com.example.WebIntegrado.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.WebIntegrado.model.Lote;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    // Consulta derivada: evita borrar un producto que todavía tiene lotes.
    boolean existsByProductoId(Long productoId);

    // JPQL: filtrar por estado
    @Query("SELECT l FROM Lote l WHERE l.estado = :estado")
    List<Lote> buscarPorEstado(@Param("estado") String estado);

    // JPQL: lotes vencidos antes de una fecha
    @Query("SELECT l FROM Lote l WHERE l.fechaVencimiento < :fecha")
    List<Lote> buscarVencidosAntesDe(@Param("fecha") LocalDate fecha);

    // JPQL: lotes de un producto por categoria/tipo
    @Query("SELECT l FROM Lote l JOIN l.producto p WHERE p.tipo = :tipo")
    List<Lote> buscarPorTipoProducto(@Param("tipo") String tipo);
}
