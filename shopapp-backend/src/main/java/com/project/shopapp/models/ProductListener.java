package com.project.shopapp.models;

import com.project.shopapp.services.product.IProductRedisService;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@AllArgsConstructor
public class ProductListener {
    private final IProductRedisService productRedisService;
    private static final Logger logger = LoggerFactory.getLogger(ProductListener.class);

    // gọi trước khi thực thể được lưu vào cơ sở dữ liệu
    @PrePersist
    public void prePersist(Product product) {
        logger.info("prePersist");
    }

    // Gọi sau khi thực thể được lưu vào cơ sở dữ liệu
    @PostPersist
    public void postPersist(Product product) {
        // Cập nhật bộ nhớ đệm Redis
        logger.info("postPersist");
        productRedisService.clearCache();
    }

    // Gọi trước khi thực thể được cập nhật
    @PreUpdate
    public void preUpdate(Product product) {
        // ApplicationEventPublisher.instance().publishEvent(event);
        logger.info("preUpdate");
    }

    // Gọi sau khi thực thể được cập nhật
    @PostUpdate
    public void postUpdate(Product product) {
        // Cập nhật bộ nhớ đệm Redis
        logger.info("postUpdate");
        productRedisService.clearCache();
    }

    // Gọi trước khi thực thể bị xóa
    @PreRemove
    public void preRemove(Product product) {
        // ApplicationEventPublisher.instance().publishEvent(event);
        logger.info("preRemove");
    }

    // Gọi sau khi thực thể bị xóa
    @PostRemove
    public void postRemove(Product product) {
        // Cập nhật bộ nhớ đệm Redis
        logger.info("postRemove");
        productRedisService.clearCache();
    }
}
