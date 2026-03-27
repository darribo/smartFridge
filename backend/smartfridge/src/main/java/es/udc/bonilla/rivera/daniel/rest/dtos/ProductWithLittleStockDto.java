package es.udc.bonilla.rivera.daniel.rest.dtos;

public class ProductWithLittleStockDto {

    private Long id;
    private String productName;
    private String productImage;
    private String quantityRemainingValue;
    private String initialQuantityValue;

    public ProductWithLittleStockDto() {}

    public ProductWithLittleStockDto(Long id, String productName, String productImage,
            String quantityRemainingValue, String initialQuantityValue) {
        this.id = id;
        this.productName = productName;
        this.productImage = productImage;
        this.quantityRemainingValue = quantityRemainingValue;
        this.initialQuantityValue = initialQuantityValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public String getQuantityRemainingValue() { return quantityRemainingValue; }
    public void setQuantityRemainingValue(String quantityRemainingValue) { this.quantityRemainingValue = quantityRemainingValue; }

    public String getInitialQuantityValue() { return initialQuantityValue; }
    public void setInitialQuantityValue(String initialQuantityValue) { this.initialQuantityValue = initialQuantityValue; }
}
