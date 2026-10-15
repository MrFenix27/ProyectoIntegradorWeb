package com.example.WebIntegrado.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

@Entity
public class Operacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El manifiesto es obligatorio")
    private String manifiesto;

    @NotBlank(message = "El transportista es obligatorio")
    private String transportista;

    @NotBlank(message = "El tipo de producto es obligatorio")
    private String tipoProducto;

    @NotEmpty(message = "Debe confirmar al menos un punto de control")
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> controlesConfirmados;

    @NotBlank(message = "El inspector es obligatorio")
    private String inspector;

    private String firma;
    private String evidencia;
    private LocalDateTime fechaRegistro;
    private String estado;

    @Column(name = "lote_id")
    private Long loteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id", insertable = false, updatable = false)
    @JsonIgnore
    private Lote lote;

    protected Operacion() {
    }

    public Operacion(String manifiesto, String transportista, String tipoProducto,
                     List<String> controlesConfirmados, String inspector,
                     String firma, String evidencia) {
        this.manifiesto = manifiesto;
        this.transportista = transportista;
        this.tipoProducto = tipoProducto;
        this.controlesConfirmados = controlesConfirmados;
        this.inspector = inspector;
        this.firma = firma;
        this.evidencia = evidencia;
    }

    public Long getId() { return id; }
    public String getManifiesto() { return manifiesto; }
    public void setManifiesto(String manifiesto) { this.manifiesto = manifiesto; }
    public String getTransportista() { return transportista; }
    public void setTransportista(String transportista) { this.transportista = transportista; }
    public String getTipoProducto() { return tipoProducto; }
    public void setTipoProducto(String tipoProducto) { this.tipoProducto = tipoProducto; }
    public List<String> getControlesConfirmados() { return controlesConfirmados; }
    public void setControlesConfirmados(List<String> controlesConfirmados) { this.controlesConfirmados = controlesConfirmados; }
    public String getInspector() { return inspector; }
    public void setInspector(String inspector) { this.inspector = inspector; }
    public String getFirma() { return firma; }
    public void setFirma(String firma) { this.firma = firma; }
    public String getEvidencia() { return evidencia; }
    public void setEvidencia(String evidencia) { this.evidencia = evidencia; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public Lote getLote() { return lote; }
    public void setLote(Lote lote) {
        this.lote = lote;
        this.loteId = (lote != null) ? lote.getId() : null;
    }
}
