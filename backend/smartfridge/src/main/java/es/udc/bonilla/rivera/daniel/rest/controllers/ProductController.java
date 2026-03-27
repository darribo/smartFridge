package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.ProductService;
import es.udc.bonilla.rivera.daniel.model.services.ResolvedBarcodeProduct;
import es.udc.bonilla.rivera.daniel.model.services.UserService;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BarcodeProductConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.BarcodeProductDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewProductItemParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewProductParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UpdateProductItemParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UpdateProductParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.AllergyConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ExpiringProductItemDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductDetailDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductItemConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductItemDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductWithItemsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ProductWithLittleStockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.SimplifiedUserDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserConversor;
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
    private static final String PRODUCT_IS_NOT_FOOD_EXCEPTION_CODE = "project.exceptions.ProductIsNotFoodException";

    private static final int SEARCH_PRODUCTS_SIZE = 5;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private ProductService productService;

    @Autowired
    private AllergyConversor allergyConversor;

    @Autowired
    private UserService userService;

    @ExceptionHandler(InvalidExpirationDateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidExpirationDateException(InvalidExpirationDateException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(INVALID_EXPIRATION_DATE_EXCEPTION_CODE, null,
                INVALID_EXPIRATION_DATE_EXCEPTION_CODE, locale);

        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(InvalidProductItemTransactionException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidProductItemTransactionException(InvalidProductItemTransactionException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(exception.getErrorCode(), null, exception.getErrorCode(), locale);

        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(ProductIsNotFoodException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleProductIsNotFoodException(ProductIsNotFoodException exception, Locale locale) {

        String errorMessage = messageSource.getMessage(PRODUCT_IS_NOT_FOOD_EXCEPTION_CODE, null,
                PRODUCT_IS_NOT_FOOD_EXCEPTION_CODE, locale);

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
            throws InstanceNotFoundException, DuplicateInstanceException, IOException {

        Product product = productService.createProduct(userId, params.getBarcode(), params.getName(), params.getBrand(),
                params.getDefaultPrice(), params.getImage(), params.getQuantity(), params.getUnit(),
                params.getIsVegetarian(), params.getIsVegan(), params.getNutriScoreGrade(), params.getNovaGroup(),
                params.getHouseholdId(), params.getAllergyIds(), params.getDaysAfterOpening());

        return ProductConversor.toProductDto(product);
    }

    @Operation(
        summary = "Crear un item de producto",
        description = "Crea un nuevo item para un producto existente indicando su ubicación dentro de la casa."
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
                params.getPurchaseDate(), params.getExpirationDate(), params.getPricePaid(), params.getStorageLocation(),
                params.getInitialQuantityValue()));
    }

    @GetMapping("/{householdId}/search")
    @Operation(
        summary = "Buscar productos por nombre",
        description = "Devuelve una lista paginada de productos de un hogar filtrados por nombre."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Búsqueda realizada correctamente",
            content = @Content(schema = @Schema(implementation = BlockDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario fuera del hogar o hogar no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public BlockDto<ProductDto> findProductsByName(@RequestAttribute Long userId, @PathVariable Long householdId, @RequestParam String name, @RequestParam int page) throws InstanceNotFoundException {

        Block<Product> block = productService.findProductsByName(userId, householdId, name, page, SEARCH_PRODUCTS_SIZE);

        
        return new BlockDto<>(ProductConversor.toProductDtos(block.getItems()), block.getExistMoreItems());
    }

    @GetMapping("/{householdId}")
    @Operation(
        summary = "Buscar productos con sus items",
        description = "Devuelve una lista paginada de productos de un hogar aplicando filtros opcionales y incluyendo sus items asociados."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Productos obtenidos correctamente",
            content = @Content(schema = @Schema(implementation = BlockDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario fuera del hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public BlockDto<ProductWithItemsDto> findProducts(@RequestAttribute Long userId, @PathVariable Long householdId,
            @RequestParam(required = false) String name, @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean isVegetarian, @RequestParam(required = false) Boolean isVegan,
            @RequestParam(required = false) Product.NutriScoreGrade nutriScoreGrade,
            @RequestParam(required = false) Product.NovaGroup novaGroup,
            @RequestParam(required = false) ProductItem.StorageLocation storageLocation,
            @RequestParam int page) throws InstanceNotFoundException {

        Block<Product> block = productService.findProducts(userId, householdId, name, brand, isVegetarian, isVegan,
                nutriScoreGrade, novaGroup, storageLocation, page, SEARCH_PRODUCTS_SIZE);

        List<ProductWithItemsDto> productWithItemsDtos = new ArrayList<>();

        for (Product product : block.getItems()) {
            List<ProductItem> productItems = productService.findProductItems(userId, product.getId());
            int countItems = productService.countProductItems(userId, product.getId());

            productWithItemsDtos.add(ProductConversor.toProductWithItemsDto(product, productItems, countItems));
        }

        return new BlockDto<>(productWithItemsDtos, block.getExistMoreItems());
    }

    @GetMapping("/{householdId}/barcode")
    @Operation(
        summary = "Buscar producto por código de barras",
        description = "Busca primero en el hogar local y, si no existe, consulta OpenFoodFacts."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Producto encontrado",
            content = @Content(schema = @Schema(implementation = BarcodeProductDto.class))),
        @ApiResponse(responseCode = "400", description = "El código corresponde a un producto no alimenticio",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado o usuario fuera del hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    public BarcodeProductDto getProductByBarcode(@RequestAttribute Long userId, @PathVariable Long householdId, @RequestParam String barcode, Locale locale)
            throws InstanceNotFoundException, ProductIsNotFoodException {
        ResolvedBarcodeProduct resolvedProduct = productService.findProductByBarcode(userId, householdId, barcode);
        return BarcodeProductConversor.toBarcodeProductDto(
                resolvedProduct.getProduct(),
                allergyConversor.toAllergyDtos(resolvedProduct.getAllergies(), locale));
    }

    @Operation(
        summary = "Subir imagen de producto",
        description = "Guarda una imagen para el producto y actualiza su URL en base de datos."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imagen subida correctamente",
            content = @Content(schema = @Schema(implementation = ProductDto.class))),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado o usuario fuera del hogar",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Archivo inválido",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductDto uploadProductImage(@RequestAttribute Long userId, @PathVariable Long productId, @RequestParam("file") MultipartFile file) throws InstanceNotFoundException, IOException {
            
        Product product = productService.uploadProductImage(userId, productId, file);

        return ProductConversor.toProductDto(product);
    }


    @GetMapping("/{productId}/detail")
    @Operation(
        summary = "Obtener detalle de un producto",
        description = "Devuelve la información completa de un producto junto con todos sus items."
    )
    public ProductDetailDto getProductDetail(@RequestAttribute Long userId, @PathVariable Long productId)
            throws InstanceNotFoundException {

        Product product = productService.getProduct(userId, productId);
        List<ProductItem> items = productService.findProductItems(userId, productId);

        return ProductConversor.toProductDetailDto(product, items);
    }

    @PutMapping("/{productId}")
    public ProductDto updateProduct(@RequestAttribute Long userId, @PathVariable Long productId,
            @Validated @RequestBody UpdateProductParamsDto params)
            throws InstanceNotFoundException, DuplicateInstanceException {

        Product product = productService.updateProduct(userId, productId,
                params.getName(), params.getBrand(), params.getDefaultPrice(),
                params.getQuantity(), params.getUnit(), params.getIsVegetarian(), params.getIsVegan(),
                params.getNutriScoreGrade(), params.getNovaGroup(), params.getDaysAfterOpening());

        return ProductConversor.toProductDto(product);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@RequestAttribute Long userId, @PathVariable Long productId)
            throws InstanceNotFoundException {

        productService.deleteProduct(userId, productId);
    }

    @PutMapping("/{productId}/items/{itemId}")
    public ProductItemDto updateProductItem(@RequestAttribute Long userId, @PathVariable Long productId,
            @PathVariable Long itemId, @Validated @RequestBody UpdateProductItemParamsDto params)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        return ProductItemConversor.toProductItemDto(productService.updateProductItem(userId, itemId,
                params.getExpirationDate(), params.getPricePaid(), params.getStorageLocation(),
                params.getInitialQuantityValue()));
    }

    @DeleteMapping("/{productId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProductItem(@RequestAttribute Long userId, @PathVariable Long productId,
            @PathVariable Long itemId) throws InstanceNotFoundException {

        productService.deleteProductItem(userId, itemId);
    }

    @GetMapping("/{householdId}/expiring")
    public BlockDto<ExpiringProductItemDto> findExpiringProducts(@RequestAttribute Long userId,
            @PathVariable Long householdId, @RequestParam(defaultValue = "0") int page) throws InstanceNotFoundException {

        Block<ProductItem> block = productService.findExpiringProducts(userId, householdId, page, SEARCH_PRODUCTS_SIZE);

        List<ExpiringProductItemDto> dtos = new ArrayList<>();
        for (ProductItem item : block.getItems()) {
            int daysRemaining = productService.getDaysUntilExpiration(item.getId());
            dtos.add(ProductItemConversor.toExpiringProductItemDto(item, daysRemaining));
        }

        return new BlockDto<>(dtos, block.getExistMoreItems());
    }

    @GetMapping("/{householdId}/littleStock")
    public BlockDto<ProductWithLittleStockDto> findProductsWithLittleStock(@RequestAttribute Long userId,
            @PathVariable Long householdId, @RequestParam(defaultValue = "0") int page) throws InstanceNotFoundException {

        Block<ProductItem> block = productService.findProductsWithLittleStock(userId, householdId, page, SEARCH_PRODUCTS_SIZE);

        List<ProductWithLittleStockDto> dtos = new ArrayList<>();
        for (ProductItem item : block.getItems()) {
            dtos.add(ProductItemConversor.toProductWithLittleStockDto(item));
        }

        return new BlockDto<>(dtos, block.getExistMoreItems());
    }



    @GetMapping("/{householdId}/count/expiring")
    public int countExpiringProducts(@RequestAttribute Long userId, @PathVariable Long householdId)
            throws InstanceNotFoundException {
        return productService.countExpiringProducts(userId, householdId);
    }

    @GetMapping("/{householdId}/count/littleStock")
    public int countProductsWithLittleStock(@RequestAttribute Long userId, @PathVariable Long householdId)
            throws InstanceNotFoundException {
        return productService.countProductsWithLittleStock(userId, householdId);
    }

    @GetMapping("/{householdId}/count/items")
    public int countProductItems(@RequestAttribute Long userId, @PathVariable Long householdId)
            throws InstanceNotFoundException {
        return productService.countProductItemsByHousehold(userId, householdId);
    }

    @GetMapping("/{householdId}/checkAllergies")
    public List<SimplifiedUserDto> checkAllergiesByIds(
            @RequestAttribute Long userId,
            @PathVariable Long householdId,
            @RequestParam(required = false) List<Long> allergyIds) throws InstanceNotFoundException {

        List<User> users = userService.findUsersByAllergyIds(userId, householdId, allergyIds);

        return UserConversor.toSimplifiedUserDtos(users);
    }
    
    
}
