package es.udc.bonilla.rivera.daniel.rest.dtos;

public class ExpiringProductItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private long daysRemaining;

    public ExpiringProductItemDto() {}

    public ExpiringProductItemDto(Long id, Long productId, String productName, String productImage, long daysRemaining) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.daysRemaining = daysRemaining;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

}
