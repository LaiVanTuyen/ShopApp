package com.project.shopapp.services.product;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.project.shopapp.responses.ProductResponse;
import org.springframework.data.domain.PageRequest;

import java.util.List;

public interface IProductRedisService {
    // clear cached data in redis
    void clearCache();

    List<ProductResponse> getAllProducts(
            String keyword,
            Long categoryId,
            PageRequest pageRequest
    ) throws JsonProcessingException;

    void saveAllProductsToCache(
            List<ProductResponse> productResponses,
            String keyword,
            Long categoryId,
            PageRequest pageRequest
    ) throws JsonProcessingException;
}
