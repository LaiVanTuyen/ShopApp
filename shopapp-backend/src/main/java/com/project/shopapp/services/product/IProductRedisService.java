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
            PageRequest pageRequest,
            Float priceMin,
            Float priceMax
    ) throws JsonProcessingException;

    Long countAllProducts(
            String keyword,
            Long categoryId,
            PageRequest pageRequest,
            Float priceMin,
            Float priceMax
    ) throws JsonProcessingException ;

    void saveAllProductsToCache(
            List<ProductResponse> productResponses,
            String keyword,
            Long categoryId,
            PageRequest pageRequest,
            Float priceMin,
            Float priceMax
    ) throws JsonProcessingException;

    List<ProductResponse> getFeaturedProducts(
            String keyword,
            Long categoryId,
            PageRequest pageRequest
    ) throws JsonProcessingException;

    void saveAllFeaturedProductsToCache(
            List<ProductResponse> productResponses,
            String keyword, Long categoryId, PageRequest pageRequest
    ) throws JsonProcessingException;

    List<ProductResponse> getLatestProducts(
            String keyword,
            Long categoryId,
            int limit
    ) throws JsonProcessingException;

    void saveAllLatestProductsToCache(
            List<ProductResponse> productResponses,
            String keyword,
            Long categoryId,
            int limit
    ) throws JsonProcessingException;
}
