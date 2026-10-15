package com.example.WebIntegrado.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.WebIntegrado.model.Rol;
import com.example.WebIntegrado.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    // JPQL: filtrar usuarios por rol
    @Query("SELECT u FROM Usuario u WHERE u.rol = :rol")
    java.util.List<Usuario> buscarPorRol(@Param("rol") Rol rol);
}
