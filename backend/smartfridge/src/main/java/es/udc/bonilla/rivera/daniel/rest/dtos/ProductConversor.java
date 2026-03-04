package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.Product;

public class ProductConversor {

    private ProductConversor() {
    }

    public static ProductDto toProductDto(Product product) {

        return new ProductDto(
                product.getId(),
                product.getBarcode(),
                product.getName(),
                product.getBrand(),
                product.getDefaultPrice() != null ? product.getDefaultPrice().toString() : null,
                product.getImage(),
                product.getQuantity() != null ? product.getQuantity().toString() : null,
                product.getUnit(),
                Boolean.TRUE.equals(product.isVegetarian()),
                Boolean.TRUE.equals(product.isVegan()),
                product.getNutriScoreGrade(),
                product.getNovaGroup(),
                product.getCreatedAt(),
                product.getHousehold().getId());
    }
}
