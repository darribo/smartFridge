package es.udc.bonilla.rivera.daniel.model.entities;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class ShoppingListItemAddedById implements Serializable {

    private Long shoppingListItemId;
    private Long userId;

    public ShoppingListItemAddedById() {}

    public ShoppingListItemAddedById(Long shoppingListItemId, Long userId) {
        this.shoppingListItemId = shoppingListItemId;
        this.userId = userId;
    }

    public Long getShoppingListItemId() { return shoppingListItemId; }
    public void setShoppingListItemId(Long shoppingListItemId) { this.shoppingListItemId = shoppingListItemId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((shoppingListItemId == null) ? 0 : shoppingListItemId.hashCode());
        result = prime * result + ((userId == null) ? 0 : userId.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        ShoppingListItemAddedById other = (ShoppingListItemAddedById) obj;
        if (shoppingListItemId == null) {
            if (other.shoppingListItemId != null) return false;
        } else if (!shoppingListItemId.equals(other.shoppingListItemId)) return false;
        if (userId == null) {
            if (other.userId != null) return false;
        } else if (!userId.equals(other.userId)) return false;
        return true;
    }
}
