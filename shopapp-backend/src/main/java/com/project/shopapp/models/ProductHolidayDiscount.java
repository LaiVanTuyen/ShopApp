package com.project.shopapp.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_holiday_discount")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductHolidayDiscount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holiday_id", nullable = false)
    private Holiday holiday;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private Double discountPercent;
}

