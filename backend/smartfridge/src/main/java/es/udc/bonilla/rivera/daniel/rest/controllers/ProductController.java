package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.ProductService;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewProductItemParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewProductParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductItemConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductItemDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
    name = "Productos",
    description = "Operaciones relacionadas con productos e items de producto."
)
@RestController
@RequestMapping("/products")
public class ProductController {

    private static final String INVALID_EXPIRATION_DATE_EXCEPTION_CODE = "project.exceptions.InvalidExpirationDateException";

    private static final int SEARCH_PRODUCTS_SIZE = 5;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ProductService productService;

    @ExceptionHandler(InvalidExpirationDateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidExpirationDateException(InvalidExpirationDateException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(INVALID_EXPIRATION_DATE_EXCEPTION_CODE, null,
                INVALID_EXPIRATION_DATE_EXCEPTION_CODE, locale);

        return new ErrorsDto(errorMessage);
    }

    @Operation(
        summary = "Crear un producto",
        description = "Crea un nuevo producto en un hogar si el usuario autenticado pertenece a ese hogar."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Producto creado",
            content = @Content(schema = @Schema(implementation = ProductDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario/hogar no encontrado o usuario fuera del hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Producto duplicado (nombre en hogar o barcode) o datos inválidos",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@RequestAttribute Long userId, @Validated @RequestBody NewProductParamsDto params)
            throws InstanceNotFoundException, DuplicateInstanceException {

        Product product = productService.createProduct(userId, params.getBarcode(), params.getName(), params.getBrand(),
                params.getDefaultPrice(), params.getImage(), params.getQuantity(), params.getUnit(),
                params.getIsVegetarian(), params.getIsVegan(), params.getNutriScoreGrade(), params.getNovaGroup(),
                params.getHouseholdId());

        return ProductConversor.toProductDto(product);
    }

    @Operation(
        summary = "Crear un item de producto",
        description = "Crea un nuevo item para un producto existente."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Item de producto creado",
            content = @Content(schema = @Schema(implementation = ProductItemDto.class))),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado o usuario fuera del hogar del producto",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Fechas inválidas o datos inválidos",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/{productId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductItemDto createProductItem(@RequestAttribute Long userId, @PathVariable Long productId,
            @Validated @RequestBody NewProductItemParamsDto params)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        return ProductItemConversor.toProductItemDto(productService.createProductItem(userId, productId,
                params.getPurchaseDate(), params.getExpirationDate(), params.getPricePaid()));
    }

    @GetMapping("/{householdId}/search")
    public BlockDto<ProductDto> findProductsByName(@RequestAttribute Long userId, @PathVariable Long householdId, @RequestParam String name, @RequestParam int page) throws InstanceNotFoundException {

        Block<Product> block = productService.findProductsByName(userId, householdId, name, page, SEARCH_PRODUCTS_SIZE);

        
        return new BlockDto<>(ProductConversor.toProductDtos(block.getItems()), block.getExistMoreItems());
    }
}
