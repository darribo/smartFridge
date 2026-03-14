package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public class ProductItemConversor {

    private ProductItemConversor() {
    }

    public static ProductItemDto toProductItemDto(ProductItem productItem) {

        return new ProductItemDto(
                productItem.getId(),
                productItem.getProduct().getId(),
                productItem.getPurchaseDate() != null ? productItem.getPurchaseDate().toString() : null,
                productItem.getExpirationDate() != null ? productItem.getExpirationDate().toString() : null,
                productItem.getPricePaid() != null ? productItem.getPricePaid().toString() : null,
                productItem.getStorageLocation());
    }

    public static List<ProductItemDto> toProductItemDtos(List<ProductItem> productItems) {

        List<ProductItemDto> productItemDtos = new ArrayList<>();

        for (ProductItem productItem : productItems) {
            productItemDtos.add(toProductItemDto(productItem));
        }

        return productItemDtos;
    }
}
