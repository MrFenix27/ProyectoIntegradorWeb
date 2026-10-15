package com.example.WebIntegrado.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;

    @NotNull(message = "La temperatura minima es obligatoria")
    private Double temperaturaMinima;

    @NotNull(message = "La temperatura maxima es obligatoria")
    private Double temperaturaMaxima;

    @Positive(message = "La vida util debe ser positiva")
    private Integer vidaUtilDias;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Lote> lotes = new ArrayList<>();

    protected Producto() {
    }

    public Producto(String nombre, String tipo, Double temperaturaMinima, Double temperaturaMaxima, Integer vidaUtilDias) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.temperaturaMinima = temperaturaMinima;
        this.temperaturaMaxima = temperaturaMaxima;
        this.vidaUtilDias = vidaUtilDias;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Double getTemperaturaMinima() { return temperaturaMinima; }
    public void setTemperaturaMinima(Double temperaturaMinima) { this.temperaturaMinima = temperaturaMinima; }
    public Double getTemperaturaMaxima() { return temperaturaMaxima; }
    public void setTemperaturaMaxima(Double temperaturaMaxima) { this.temperaturaMaxima = temperaturaMaxima; }
    public Integer getVidaUtilDias() { return vidaUtilDias; }
    public void setVidaUtilDias(Integer vidaUtilDias) { this.vidaUtilDias = vidaUtilDias; }
    public List<Lote> getLotes() { return lotes; }
    public void setLotes(List<Lote> lotes) { this.lotes = lotes; }
}
