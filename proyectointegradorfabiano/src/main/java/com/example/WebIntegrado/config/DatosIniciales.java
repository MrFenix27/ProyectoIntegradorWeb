package com.example.WebIntegrado.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.WebIntegrado.model.Lote;
import com.example.WebIntegrado.model.Operacion;
import com.example.WebIntegrado.model.Producto;
import com.example.WebIntegrado.model.RegistroTemperatura;
import com.example.WebIntegrado.model.Rol;
import com.example.WebIntegrado.model.Usuario;
import com.example.WebIntegrado.repository.LoteRepository;
import com.example.WebIntegrado.repository.OperacionRepository;
import com.example.WebIntegrado.repository.ProductoRepository;
import com.example.WebIntegrado.repository.RegistroTemperaturaRepository;
import com.example.WebIntegrado.repository.UsuarioRepository;

@Configuration
public class DatosIniciales {

    @Bean
    CommandLineRunner cargarDatos(ProductoRepository productos, LoteRepository lotes,
                                  RegistroTemperaturaRepository temperaturas,
                                  OperacionRepository operaciones,
                                  UsuarioRepository usuarios,
                                  PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarios.count() == 0) {
                usuarios.save(new Usuario("admin", passwordEncoder.encode("admin123"), Rol.ADMIN));
                usuarios.save(new Usuario("user", passwordEncoder.encode("user123"), Rol.USER));
                usuarios.save(new Usuario("guest", passwordEncoder.encode("guest123"), Rol.GUEST));
            }

            if (productos.count() > 0) {
                return;
            }

            Producto vacuna = productos.save(new Producto("Vacuna Tipo A", "Biologico", 2.0, 8.0, 90));
            Producto plasma = productos.save(new Producto("Plasma Sanguineo", "Hemoderivado", -40.0, -20.0, 180));
            Producto reactivo = productos.save(new Producto("Reactivos Quimicos", "Reactivo", 2.0, 8.0, 60));

            Lote loteVacuna = lotes.save(new Lote("VAX-789", LocalDate.of(2026, 12, 20), "ACTIVO", vacuna));
            Lote lotePlasma = lotes.save(new Lote("PLSM-011", LocalDate.of(2027, 1, 15), "ACTIVO", plasma));
            Lote loteReactivo = lotes.save(new Lote("REAG-55", LocalDate.of(2026, 10, 5), "EN_RIESGO", reactivo));

            temperaturas.save(new RegistroTemperatura(2.4, LocalDateTime.now().minusMinutes(2), loteVacuna, "Almacen A"));
            temperaturas.save(new RegistroTemperatura(-30.2, LocalDateTime.now().minusMinutes(3), lotePlasma, "Camara Fria 2"));
            temperaturas.save(new RegistroTemperatura(9.1, LocalDateTime.now().minusMinutes(1), loteReactivo, "Camion TR-04"));

            Operacion despacho = new Operacion("MF-2026-001", "ColdTrace Logistics",
                    "Despacho - Vacuna Tipo A",
                    List.of("Pre-enfriamiento: Verificado", "Vehículo: TRK-402", "Conductor: A. Torres", "Destino: Centro Norte"),
                    "A. Torres", null, null);
            despacho.setFechaRegistro(LocalDateTime.now().minusHours(3));
            despacho.setEstado("RECEPCIONADO");
            operaciones.save(despacho);

            Operacion recepcion = new Operacion("MF-2026-002", "ColdTrace Logistics",
                    "Recepción - Plasma Sanguíneo",
                    List.of("Sellos intactos: true", "Sin daños: true", "Datalogger: Normal (sin alertas)", "Temperatura de llegada: -25.0°C"),
                    "Responsable de recepción", null, null);
            recepcion.setFechaRegistro(LocalDateTime.now().minusHours(2));
            recepcion.setEstado("RECEPCIONADO");
            operaciones.save(recepcion);

            Operacion pendiente = new Operacion("MF-2026-003", "ColdTrace Logistics",
                    "Despacho - Reactivos Quimicos",
                    List.of("Pre-enfriamiento: Verificado", "Vehículo: TRK-118", "Conductor: M. Rios", "Destino: Centro Sur"),
                    "M. Rios", null, null);
            pendiente.setFechaRegistro(LocalDateTime.now().minusMinutes(30));
            pendiente.setEstado("EN_TRANSITO");
            pendiente.setLoteId(loteVacuna.getId());
            operaciones.save(pendiente);
        };
    }
}
