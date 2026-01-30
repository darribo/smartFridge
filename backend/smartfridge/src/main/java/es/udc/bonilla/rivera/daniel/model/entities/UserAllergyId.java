package es.udc.bonilla.rivera.daniel.model.entities;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class UserAllergyId implements Serializable {

    private Long userId;
    private Long allergyId;

    public UserAllergyId() {}

    public UserAllergyId(Long userId, Long allergyId) {
        this.userId = userId;
        this.allergyId = allergyId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAllergyId() {
        return allergyId;
    }

    public void setAllergyId(Long allergyId) {
        this.allergyId = allergyId;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((userId == null) ? 0 : userId.hashCode());
        result = prime * result + ((allergyId == null) ? 0 : allergyId.hashCode());
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
        UserAllergyId other = (UserAllergyId) obj;
        if (userId == null) {
            if (other.userId != null)
                return false;
        } else if (!userId.equals(other.userId))
            return false;
        if (allergyId == null) {
            if (other.allergyId != null)
                return false;
        } else if (!allergyId.equals(other.allergyId))
            return false;
        return true;
    }

    

}
