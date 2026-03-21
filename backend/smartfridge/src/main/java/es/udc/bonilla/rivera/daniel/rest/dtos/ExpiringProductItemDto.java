package es.udc.bonilla.rivera.daniel.rest.dtos;

public class ExpiringProductItemDto {

    private Long id;
    private String productName;
    private String productImage;
    private long daysRemaining;

    public ExpiringProductItemDto() {}

    public ExpiringProductItemDto(Long id, String productName, String productImage, long daysRemaining) {
        this.id = id;
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
