package es.udc.bonilla.rivera.daniel.model.services;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Product;

public class ResolvedBarcodeProduct {

    private final Product product;
    private final List<Allergy> allergies;

    public ResolvedBarcodeProduct(Product product, List<Allergy> allergies) {
        this.product = product;
        this.allergies = allergies;
    }

    public Product getProduct() {
        return product;
    }

    public List<Allergy> getAllergies() {
        return allergies;
    }
}
