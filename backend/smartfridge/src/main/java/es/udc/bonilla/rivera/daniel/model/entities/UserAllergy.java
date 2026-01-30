package es.udc.bonilla.rivera.daniel.model.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class UserAllergy {

    private UserAllergyId id;
    private User user;
    private Allergy allergy;

    public UserAllergy() {}

    public UserAllergy(User user, Allergy allergy) {
        this.user = user;
        this.allergy = allergy;
        this.id = new UserAllergyId(user.getId(), allergy.getId());
    }

    @EmbeddedId
    public UserAllergyId getId() {
        return id;
    }
    public void setId(UserAllergyId id) {
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
    @MapsId("allergyId") //Indica qué parte de la clave viene de esta relación
    @JoinColumn(name = "allergyId")
    public Allergy getAllergy() {
        return allergy;
    }

    public void setAllergy(Allergy allergy) {
        this.allergy = allergy;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((user == null) ? 0 : user.hashCode());
        result = prime * result + ((allergy == null) ? 0 : allergy.hashCode());
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
        UserAllergy other = (UserAllergy) obj;
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
        if (allergy == null) {
            if (other.allergy != null)
                return false;
        } else if (!allergy.equals(other.allergy))
            return false;
        return true;
    }
}