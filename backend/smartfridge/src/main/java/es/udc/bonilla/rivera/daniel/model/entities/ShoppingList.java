package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;

@Entity
public class ShoppingList {

    public enum Status {
        ACTIVE,
        COMPLETED
    }

    private Long id;
    private Household household;
    private User createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Status status;
    private Long version;

    public ShoppingList() {}

    public ShoppingList(Household household, User createdBy, LocalDateTime createdAt) {
        this.household = household;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.status = Status.ACTIVE;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "householdId")
    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdBy")
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    @Column(nullable = false)
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    @Version
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
