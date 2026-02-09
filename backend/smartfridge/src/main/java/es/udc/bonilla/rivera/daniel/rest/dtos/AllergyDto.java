package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "Allergy",
    description = "DTO que representa una alergia del catálogo"
)
public class AllergyDto {

    @Schema(
        description = "Identificador único de la alergia",
        example = "3"
    )
    Long id;

    @Schema(
        description = "Nombre localizado de la alergia",
        example = "Gluten"
    )
    String name;

    @Schema(
        description = "Descripción localizada de la alergia",
        example = "Proteínas presentes en cereales como trigo, cebada o centeno"
    )
    String description;

    @Schema(
        description = "Etiqueta técnica o clave interna de la alergia",
        example = "GLUTEN"
    )
    String tag;

    @Schema(
        description = "Identificador del icono asociado a la alergia",
        example = "wheat"
    )
    String icon;

    public AllergyDto() {}

    public AllergyDto(Long id, String name, String description, String tag, String icon) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tag = tag;
        this.icon = icon;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getTag() {
        return tag;
    }
    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getIcon() {
        return icon;
    }
    public void setIcon(String icon) {
        this.icon = icon;
    }
}
