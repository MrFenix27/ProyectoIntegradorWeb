package com.example.WebIntegrado.dto;

import jakarta.validation.constraints.NotNull;

public class RecepcionRequest {

    @NotNull(message = "La temperatura de llegada es obligatoria")
    private Double temperatura;

    private String logger;
    private Boolean sello;
    private Boolean dano;
    private String firma;

    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }
    public String getLogger() { return logger; }
    public void setLogger(String logger) { this.logger = logger; }
    public Boolean getSello() { return sello; }
    public void setSello(Boolean sello) { this.sello = sello; }
    public Boolean getDano() { return dano; }
    public void setDano(Boolean dano) { this.dano = dano; }
    public String getFirma() { return firma; }
    public void setFirma(String firma) { this.firma = firma; }
}
