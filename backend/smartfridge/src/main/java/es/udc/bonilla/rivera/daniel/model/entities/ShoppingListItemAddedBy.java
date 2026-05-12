package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class ShoppingListItemAddedBy {

    private ShoppingListItemAddedById id;
    private ShoppingListItem shoppingListItem;
    private User user;
    private LocalDateTime addedAt;

    public ShoppingListItemAddedBy() {}

    public ShoppingListItemAddedBy(ShoppingListItem shoppingListItem, User user, LocalDateTime addedAt) {
        this.shoppingListItem = shoppingListItem;
        this.user = user;
        this.addedAt = addedAt;
        this.id = new ShoppingListItemAddedById(shoppingListItem.getId(), user.getId());
    }

    @EmbeddedId
    public ShoppingListItemAddedById getId() { return id; }
    public void setId(ShoppingListItemAddedById id) { this.id = id; }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("shoppingListItemId")
    @JoinColumn(name = "shoppingListItemId")
    public ShoppingListItem getShoppingListItem() { return shoppingListItem; }
    public void setShoppingListItem(ShoppingListItem shoppingListItem) { this.shoppingListItem = shoppingListItem; }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "userId")
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @Column(nullable = false)
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
