package es.udc.bonilla.rivera.daniel.model.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class UserHousehold {

    private UserHouseholdId id;
    private User user;
    private Household household;

    public UserHousehold() {}

    public UserHousehold(User user, Household household) {
        this.user = user;
        this.household = household;
        this.id = new UserHouseholdId(user.getId(), household.getId());
    }

    @EmbeddedId
    public UserHouseholdId getId() {
        return id;
    }
    public void setId(UserHouseholdId id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch=FetchType.LAZY)
    @MapsId("userId") //Indica qué parte de la clave viene de esta relación
    @JoinColumn(name = "userId")
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    @ManyToOne(optional = false, fetch=FetchType.LAZY)
    @MapsId("householdId") //Indica qué parte de la clave viene de esta relación
    @JoinColumn(name = "householdId")
    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((user == null) ? 0 : user.hashCode());
        result = prime * result + ((household == null) ? 0 : household.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        UserHousehold other = (UserHousehold) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (user == null) {
            if (other.user != null)
                return false;
        } else if (!user.equals(other.user))
            return false;
        if (household == null) {
            if (other.household != null)
                return false;
        } else if (!household.equals(other.household))
            return false;
        return true;
    }

}
