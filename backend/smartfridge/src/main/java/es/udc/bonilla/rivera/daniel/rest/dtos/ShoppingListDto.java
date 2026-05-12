package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;

public class ShoppingListDto {

    private Long id;
    private ShoppingList.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String createdByName;
    private List<ShoppingListItemDto> items;

    public ShoppingListDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ShoppingList.Status getStatus() { return status; }
    public void setStatus(ShoppingList.Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public List<ShoppingListItemDto> getItems() { return items; }
    public void setItems(List<ShoppingListItemDto> items) { this.items = items; }
}
