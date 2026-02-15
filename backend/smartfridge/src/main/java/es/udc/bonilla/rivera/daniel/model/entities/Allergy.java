package es.udc.bonilla.rivera.daniel.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Allergy {

    private Long id;
    private String tag; //Correspondiente al tag asociado con OpenFoodFacts

    public Allergy() {}

    public Allergy(String tag) {
        this.tag = tag;
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getTag() {
        return tag;
    }
    public void setTag(String tag) {
        this.tag = tag;
    }

}
