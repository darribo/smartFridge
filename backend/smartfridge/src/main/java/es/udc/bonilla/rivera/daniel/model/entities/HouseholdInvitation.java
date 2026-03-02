/* package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class HouseholdInvitation {

    public enum Status {
        ACCEPTED,
        PENDING,
        REJECTED
    }

    private Long id;
    private Household household;
    private User host;
    private User guest;
    private LocalDateTime sendingDate;
    private LocalDateTime responseDate;
    private Status status;

    public HouseholdInvitation() {}


    public HouseholdInvitation(Household household, User host, User guest, LocalDateTime sendingDate,
            LocalDateTime responseDate, Status status) {
        this.household = household;
        this.host = host;
        this.guest = guest;
        this.sendingDate = sendingDate;
        this.responseDate = responseDate;
        this.status = status;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch=FetchType.LAZY)
    @JoinColumn(name="householdId")
    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }


    @ManyToOne(optional = false, fetch=FetchType.LAZY)
    @JoinColumn(name="hostId")
    public User getHost() {
        return host;
    }

    public void setHost(User host) {
        this.host = host;
    }


    @ManyToOne(optional = false, fetch=FetchType.LAZY)
    @JoinColumn(name="guestId")
    public User getGuest() {
        return guest;
    }

    public void setGuest(User guest) {
        this.guest = guest;
    }


    public LocalDateTime getSendingDate() {
        return sendingDate;
    }

    public void setSendingDate(LocalDateTime sendingDate) {
        this.sendingDate = sendingDate;
    }


    public LocalDateTime getResponseDate() {
        return responseDate;
    }

    public void setResponseDate(LocalDateTime responseDate) {
        this.responseDate = responseDate;
    }


    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
    

}
 */