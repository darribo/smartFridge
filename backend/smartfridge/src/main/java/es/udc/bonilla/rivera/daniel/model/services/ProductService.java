package es.udc.bonilla.rivera.daniel.model.services;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;

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
            Product.NovaGroup novaGroup, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException;

    /**
     * Actualiza los datos editables de un producto.
     *
     * @param userId Identificador del usuario que realiza la operación.
     * @param productId Identificador del producto a actualizar.
     * @param name Nuevo nombre del producto.
     * @param defaultPrice Nuevo precio por defecto.
     * @param image Nueva imagen.
     * @param quantity Nueva cantidad.
     * @return La entidad {@code Product} actualizada.
     * @throws InstanceNotFoundException Si el producto no existe o el usuario no pertenece al hogar del producto.
     * @throws DuplicateInstanceException Si el nuevo nombre ya existe en otro producto del mismo hogar.
     */
    Product updateProduct(Long userId, Long productId, String name, String defaultPrice, String image, String quantity)
            throws InstanceNotFoundException, DuplicateInstanceException;

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
     */
    ProductItem createProductItem(Long userId, Long productId, String purchaseDate, String expirationDate, String pricePaid)
            throws InstanceNotFoundException, InvalidExpirationDateException;

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
    ProductItem updateProductItem(Long userId, Long productItemId, String purchaseDate, String expirationDate, String pricePaid)
            throws InstanceNotFoundException, InvalidExpirationDateException;

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

}
