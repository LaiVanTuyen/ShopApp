package com.project.shopapp.repositories;

import com.project.shopapp.models.ProductHolidayDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductHolidayDiscountRepository extends JpaRepository<ProductHolidayDiscount, Integer> {
    @Query("SELECT phd.discountPercent FROM ProductHolidayDiscount phd " +
           "JOIN phd.holiday h " +
           "WHERE phd.product.id = :productId AND h.date = :currentDate")
    Double findDiscountPercentByProductIdAndDate(@Param("productId") Long productId, @Param("currentDate") java.sql.Date currentDate);
}

