package es.udc.bonilla.rivera.daniel.model.services;

import java.math.BigDecimal;

import es.udc.bonilla.rivera.daniel.model.entities.Product.NovaGroup;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NutriScoreGrade;
import es.udc.bonilla.rivera.daniel.model.entities.Product.Unit;

public record BarcodeProduct(Long id, String barcode, String name, String brand, BigDecimal defaultPrice, String image, BigDecimal quantity,
    Unit unit, Boolean vegetarian, Boolean vegan, NutriScoreGrade nutriScoreGrade, NovaGroup novaGroup, boolean foundInLocal) {}