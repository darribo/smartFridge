package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

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
                product.getDaysAfterOpening());
    }

    public static List<ProductDto> toProductDtos(List<Product> products) {
        
        List<ProductDto> productDtos = new ArrayList<>();

        for (Product product : products) {
            productDtos.add(toProductDto(product));
        }

        return productDtos;
    }

    public static ProductWithItemsDto toProductWithItemsDto(Product product, List<ProductItem> productItems, int countItems, boolean hasActiveItems) {

        return new ProductWithItemsDto(
                product.getId(),
                product.getName(),
                product.getImage(),
                product.getQuantity() != null ? product.getQuantity().toString() : null,
                product.getUnit(),
                countItems,
                ProductItemConversor.toProductItemDtos(productItems),
                hasActiveItems);
    }

    public static ProductDto toProductDtoWithStock(Product product, boolean hasActiveItems) {
        ProductDto dto = toProductDto(product);
        dto.setHasActiveItems(hasActiveItems);
        return dto;
    }

    public static ProductDetailDto toProductDetailDto(Product product, List<ProductItem> productItems) {

        return new ProductDetailDto(
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
                product.getDaysAfterOpening(),
                ProductItemConversor.toProductItemDtos(productItems));
    }
}
