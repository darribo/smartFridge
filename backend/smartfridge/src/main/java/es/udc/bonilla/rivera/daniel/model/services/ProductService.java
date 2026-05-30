package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.common.OptimisticLockingException;
import java.math.BigDecimal;

import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;

public interface ProductService {

    /**
     * Crea un nuevo producto dentro de un hogar.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param barcode Código de barras del producto.
     * @param name Nombre del producto.
     * @param brand Marca del producto.
     * @param defaultPrice Precio por defecto del producto.
     * @param image Imagen del producto.
     * @param quantity Cantidad del producto.
     * @param unit Unidad de medida del producto.
     * @param isVegetarian Indica si el producto es vegetariano.
     * @param isVegan Indica si el producto es vegano.
     * @param nutriScoreGrade Grado Nutri-Score.
     * @param novaGroup Grupo NOVA.
     * @param householdId Identificador del hogar al que pertenece el producto.
     * @return La entidad {@code Product} creada.
     * @throws InstanceNotFoundException Si el usuario no pertenece al hogar o el hogar no existe.
     * @throws DuplicateInstanceException Si ya existe un producto con el mismo nombre en el hogar
     * o si ya existe un producto con el mismo código de barras.
     */
    Product createProduct(Long userId, String barcode, String name, String brand, String defaultPrice, String image,
            String quantity, Product.Unit unit, Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Long householdId, List<Long> allergyIds, Integer daysAfterOpening)
            throws InstanceNotFoundException, DuplicateInstanceException, IOException;

    /**
     * Actualiza los datos editables de un producto.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productId Identificador del producto a actualizar.
     * @return La entidad {@code Product} actualizada.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar del producto.
     * @throws DuplicateInstanceException Si el nuevo nombre ya existe en otro producto del mismo hogar.
     */
    Product updateProduct(Long userId, Long productId, Long version, String name, String brand,
            String defaultPrice, String quantity, Product.Unit unit,
            Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Integer daysAfterOpening)
            throws InstanceNotFoundException, DuplicateInstanceException, OptimisticLockingException;

    /**
     * Recupera un producto si el usuario pertenece al hogar del producto.
     *
     * @param userId Identificador del usuario que realiza la consulta.
     * @param productId Identificador del producto.
     * @return La entidad {@code Product} encontrada.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar.
     */
    Product getProduct(Long userId, Long productId) throws InstanceNotFoundException;

    /**
     * Elimina un producto si el usuario pertenece al hogar del producto.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productId Identificador del producto a eliminar.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar.
     */
    void deleteProduct(Long userId, Long productId) throws InstanceNotFoundException;

    /**
     * Crea un item de producto asociado a un producto existente.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productId Identificador del producto asociado.
     * @param purchaseDate Fecha de compra del item.
     * @param expirationDate Fecha de caducidad del item.
     * @param pricePaid Precio pagado del item.
     * @return La entidad {@code ProductItem} creada.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar del producto.
     * @throws InvalidExpirationDateException Si la fecha de caducidad es anterior a la fecha de compra.
 * @throws InvalidProductItemTransactionException 
     */
    ProductItem createProductItem(Long userId, Long productId, String purchaseDate, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation, String initialQuantityValue)
            throws InstanceNotFoundException, InvalidExpirationDateException, InvalidProductItemTransactionException;

    /**
     * Actualiza los datos editables de un item de producto.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productItemId Identificador del item de producto.
     * @param purchaseDate Nueva fecha de compra.
     * @param expirationDate Nueva fecha de caducidad.
     * @param pricePaid Nuevo precio pagado.
     * @return La entidad {@code ProductItem} actualizada.
     * @throws InstanceNotFoundException Si el item no existe o el usuario no pertenece al hogar del producto asociado.
     * @throws InvalidExpirationDateException Si la fecha de caducidad es anterior a la fecha de compra.
     */
    ProductItem updateProductItem(Long userId, Long productItemId, Long version, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation, String quantityRemainingValue)
            throws InstanceNotFoundException, InvalidExpirationDateException, OptimisticLockingException;

    /**
     * Recupera un item de producto si el usuario pertenece al hogar del producto asociado.
     *
     * @param userId Identificador del usuario que realiza la consulta.
     * @param productItemId Identificador del item de producto.
     * @return La entidad {@code ProductItem} encontrada.
     * @throws InstanceNotFoundException Si el item no existe o el usuario no pertenece al hogar del producto asociado.
     */
    ProductItem getProductItem(Long userId, Long productItemId) throws InstanceNotFoundException;

    /**
     * Elimina un item de producto si el usuario pertenece al hogar del producto asociado.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productItemId Identificador del item de producto a eliminar.
     * @throws InstanceNotFoundException Si el item no existe o el usuario no pertenece al hogar del producto asociado.
     */
    void deleteProductItem(Long userId, Long productItemId) throws InstanceNotFoundException;

    /**
     * Busca productos de un hogar por nombre de forma paginada.
     *
     * @param userId Identificador del usuario que realiza la consulta.
     * @param householdId Identificador del hogar donde se realiza la búsqueda.
     * @param name Texto a buscar sobre el nombre del producto.
     * @param page Número de página solicitada.
     * @param size Tamaño de página.
     * @return Bloque paginado con los productos encontrados.
     * @throws InstanceNotFoundException Si el usuario no pertenece al hogar indicado.
     */
    Block<Product> findProductsByName(Long userId, Long householdId, String name, int page, int size) throws InstanceNotFoundException;

    /**
     * Busca un producto por código de barras dentro de un hogar.
     * Si no existe localmente, intenta resolverlo mediante OpenFoodFacts.
     *
     * @param userId Identificador del usuario que realiza la consulta.
     * @param householdId Identificador del hogar donde se busca el producto.
     * @param barcode Código de barras del producto.
     * @return La entidad {@code Product} encontrada o construida desde OpenFoodFacts.
     * @throws InstanceNotFoundException Si el usuario no pertenece al hogar o no se encuentra el producto.
     * @throws ProductIsNotFoodException Si el código corresponde a un producto no alimenticio.
     */
    ResolvedBarcodeProduct findProductByBarcode(Long userId, Long householdId, String barcode) throws InstanceNotFoundException, ProductIsNotFoodException;

    /**
     * Sube una imagen asociada a un producto y actualiza su URL en base de datos.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productId Identificador del producto al que se asocia la imagen.
     * @param file Archivo de imagen en formato multipart.
     * @return La entidad {@code Product} actualizada con la nueva URL de imagen.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar del producto.
     * @throws IOException Si ocurre un error durante el almacenamiento físico del archivo.
     */
    Product uploadProductImage(Long userId, Long productId, MultipartFile file) throws InstanceNotFoundException, IOException;

    ProductsPage findProducts(Long userId, Long householdId, String name, String brand, Boolean isVegetarian, Boolean isVegan,
        Product.NutriScoreGrade nutriScoreGrade, Product.NovaGroup novaGroup, ProductItem.StorageLocation storageLocation, int page, int size) throws InstanceNotFoundException;

    void addFavoriteProduct(Long userId, Long productId) throws InstanceNotFoundException, DuplicateInstanceException;

    void removeFavoriteProduct(Long userId, Long productId) throws InstanceNotFoundException;

    List<ProductItem> findProductItems(Long userId, Long productId) throws InstanceNotFoundException;

    int countProductItems(Long userId, Long productId) throws InstanceNotFoundException;

    int countActiveProductItems(Long userId, Long productId) throws InstanceNotFoundException;

    ProductAllergy addProductAllergy(Long userId, Long productId, Long allergyId)
            throws InstanceNotFoundException, DuplicateInstanceException;

    ProductAllergy getProductAllergy(Long userId, Long productId, Long allergyId) throws InstanceNotFoundException;

    void removeProductAllergy(Long userId, Long productId, Long allergyId) throws InstanceNotFoundException;

    Block<ProductItem> findExpiringProducts(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException;

    int getDaysUntilExpiration(Long productItemId) throws InstanceNotFoundException;

    Block<ProductItem> findProductsWithLittleStock(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException;

    int countExpiringProducts(Long userId, Long householdId) throws InstanceNotFoundException;

    int countProductsWithLittleStock(Long userId, Long householdId) throws InstanceNotFoundException;

    int countProductItemsByHousehold(Long userId, Long householdId) throws InstanceNotFoundException;

    ProductItem discardProductItem(Long userId, Long productItemId) throws InstanceNotFoundException, InvalidProductItemTransactionException;

    ProductItem openProductItem(Long userId, Long productItemId) throws InstanceNotFoundException, InvalidProductItemTransactionException;

    ProductItem consumeProductItem(Long userId, Long productItemId, BigDecimal amount, CookedRecipe cookedRecipe) throws InstanceNotFoundException, InvalidProductItemTransactionException;

    ProductItem adjustProductItem(Long userId, Long productItemId, BigDecimal newQuantity) throws InstanceNotFoundException, InvalidProductItemTransactionException;

}
