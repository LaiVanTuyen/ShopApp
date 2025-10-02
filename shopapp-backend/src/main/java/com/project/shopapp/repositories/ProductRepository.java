package com.project.shopapp.repositories;

import com.project.shopapp.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByName(String name);

    Page<Product> findAll(Pageable pageable);//phân trang

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR :categoryId = 0 OR p.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.name LIKE %:keyword% OR p.description LIKE %:keyword%)")
    Page<Product> searchProducts
            (@Param("categoryId") Long categoryId,
             @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.productImages WHERE p.id = :productId")
    Optional<Product> getDetailProduct(@Param("productId") Long productId);

    @Query("SELECT p FROM Product p WHERE p.id IN :productIds")
    List<Product> findProductsByIds(@Param("productIds") List<Long> productIds);

    @Query("SELECT p FROM Product p WHERE " +
            "(:categoryId IS NULL OR :categoryId = 0 OR p.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.name LIKE %:keyword% OR p.description LIKE %:keyword%)" +
            "AND p.isFeatured = true")
    Page<Product> searchFeaturedProducts(Long categoryId, String keyword, Pageable pageable);


        @Query("SELECT p FROM Product p WHERE (:categoryId IS NULL OR :categoryId = 0 OR p.category.id = :categoryId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR p.name LIKE %:keyword% OR p.description LIKE %:keyword%) " +
            "ORDER BY p.createdAt DESC")
    List<Product> searchLatestProducts(@Param("categoryId") Long categoryId,
                                       @Param("keyword") String keyword,
                                       Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN p.comments c " +
            "GROUP BY p.id " +
            "ORDER BY COALESCE(AVG(c.rating), 0) DESC")
    Page<Product> findTopRatedProducts(Pageable pageable);

    @Query(value = "SELECT p.*, "+
            "COALESCE(phd.discount_percent, p.sale_percent) AS actual_sale_percent "+
            "FROM products p "+
            "LEFT JOIN product_holiday_discount phd ON phd.product_id = p.id "+
            "LEFT JOIN holidays h ON phd.holiday_id = h.id AND h.date = :currentDate "+
            "ORDER BY actual_sale_percent DESC",
            nativeQuery = true)
    List<Object[]> findTopSalesProducts(@Param("currentDate") java.sql.Date currentDate, Pageable pageable);
}
