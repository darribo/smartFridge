package es.udc.bonilla.rivera.daniel.model.services;

import java.util.Set;

import es.udc.bonilla.rivera.daniel.model.entities.Product;

public class ProductsPage {

    private final Block<Product> products;
    private final Set<Long> favoriteProductIds;

    public ProductsPage(Block<Product> products, Set<Long> favoriteProductIds) {
        this.products = products;
        this.favoriteProductIds = favoriteProductIds;
    }

    public Block<Product> getProducts() {
        return products;
    }

    public Set<Long> getFavoriteProductIds() {
        return favoriteProductIds;
    }

}
