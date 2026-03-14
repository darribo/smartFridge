package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Product;

public class BarcodeProductConversor {

    private BarcodeProductConversor() {
    }

    public static BarcodeProductDto toBarcodeProductDto(Product product, List<AllergyDto> allergies) {
        return new BarcodeProductDto(
                product.getId(),
                product.getBarcode(),
                product.getName(),
                product.getBrand(),
                product.getDefaultPrice() != null ? product.getDefaultPrice().toString() : null,
                product.getImage(),
                product.getQuantity() != null ? product.getQuantity().toString() : null,
                product.getUnit(),
                product.isVegetarian(),
                product.isVegan(),
                product.getNutriScoreGrade(),
                product.getNovaGroup(),
                allergies);
    }
}
