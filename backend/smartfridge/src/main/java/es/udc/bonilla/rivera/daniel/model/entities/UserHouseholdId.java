package es.udc.bonilla.rivera.daniel.model.entities;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class UserHouseholdId implements Serializable {

    private Long userId;
    private Long householdId;

    public UserHouseholdId() {}

    public UserHouseholdId(Long userId, Long householdId) {
        this.userId = userId;
        this.householdId = householdId;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getHouseholdId() {
        return householdId;
    }
    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((userId == null) ? 0 : userId.hashCode());
        result = prime * result + ((householdId == null) ? 0 : householdId.hashCode());
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
        UserHouseholdId other = (UserHouseholdId) obj;
        if (userId == null) {
            if (other.userId != null)
                return false;
        } else if (!userId.equals(other.userId))
            return false;
        if (householdId == null) {
            if (other.householdId != null)
                return false;
        } else if (!householdId.equals(other.householdId))
            return false;
        return true;
    }

}
