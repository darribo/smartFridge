package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "Block",
    description = "DTO de paginación que contiene los elementos y si existen más resultados"
)
public class BlockDto<T> {
	
    @Schema(
        description = "Lista de elementos devueltos en la página actual"
    )
	private List<T> items;

    @Schema(
        description = "Indica si existen más elementos en páginas posteriores",
        example = "true"
    )
    private boolean existMoreItems;
    
    public BlockDto() {}

    public BlockDto(List<T> items, boolean existMoreItems) {
        
        this.items = items;
        this.existMoreItems = existMoreItems;

    }
    
    public List<T> getItems() {
        return items;
    }
    
    public void setItems(List<T> items) {
		this.items = items;
	}
    
	public boolean getExistMoreItems() {
        return existMoreItems;
    }
	
	public void setExistMoreItems(boolean existMoreItems) {
		this.existMoreItems = existMoreItems;
	}
    
}
