package com.example.WebIntegrado.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.WebIntegrado.dto.AuthResponse;
import com.example.WebIntegrado.dto.LoginRequest;
import com.example.WebIntegrado.dto.RegisterRequest;
import com.example.WebIntegrado.model.Rol;
import com.example.WebIntegrado.model.Usuario;
import com.example.WebIntegrado.repository.UsuarioRepository;
import com.example.WebIntegrado.security.JwtUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UsuarioRepository usuarios, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (usuarios.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El username ya existe");
        }
        Rol rol;
        try {
            rol = Rol.valueOf(req.getRol().toUpperCase());
        } catch (Exception e) {
            rol = Rol.USER;
        }
        Usuario u = new Usuario(req.getUsername(), passwordEncoder.encode(req.getPassword()), rol);
        usuarios.save(u);
        String token = jwtUtil.generarToken(u.getUsername(), u.getRol().name());
        return new AuthResponse(token, u.getUsername(), u.getRol().name());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        Usuario u = usuarios.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        String token = jwtUtil.generarToken(u.getUsername(), u.getRol().name());
        return new AuthResponse(token, u.getUsername(), u.getRol().name());
    }
}
