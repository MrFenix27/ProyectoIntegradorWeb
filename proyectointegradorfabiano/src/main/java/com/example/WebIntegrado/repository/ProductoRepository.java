package com.example.WebIntegrado.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.WebIntegrado.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // JPQL: filtrar por tipo/categoria
    @Query("SELECT p FROM Producto p WHERE p.tipo = :tipo")
    List<Producto> buscarPorTipo(@Param("tipo") String tipo);

    // JPQL: productos cuyo rango de temperatura cubre un valor dado
    @Query("SELECT p FROM Producto p WHERE p.temperaturaMinima <= :temp AND p.temperaturaMaxima >= :temp")
    List<Producto> buscarPorTemperaturaObjetivo(@Param("temp") Double temperatura);
}
