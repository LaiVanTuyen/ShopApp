package com.project.shopapp.services.product;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.shopapp.responses.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductRedisService implements IProductRedisService {
    /**
     * RedisTemplate: Lớp này cung cấp các phương thức để thao tác với Redis
     * ObjectMapper: Lớp này cung cấp các phương thức để chuyển đổi giữa các đối tượng Java và các chuỗi JSON
     *
     */
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper redisObjectMapper;

    // Hàm này tạo ra khóa (key) từ các tham số đầu vào
    private String getKeyFrom(String keyword, Long categoryId, PageRequest pageRequest) {
        int pageNumber = pageRequest.getPageNumber();
        int pageSize = pageRequest.getPageSize();
        Sort.Order order = pageRequest.getSort().getOrderFor("id");
        String sortDirection = (order != null && order.getDirection() == Sort.Direction.ASC) ? "ASC" : "DESC";
        return String.format("all_products:%d:%d:%s", pageNumber, pageSize, sortDirection);
        /*
        {
            "all_products:1:10:asc": "list of products object"
        }
        * */
    }

    // Hàm này xóa toàn bộ cache trong Redis
    @Override
    public void clearCache() {
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }

    // Hàm này lấy tất cả sản phẩm từ cache Redis
    @Override
    public List<ProductResponse> getAllProducts(String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisTemplate.opsForValue().get(key);
        // Nếu json không null, chuyển đổi json thành danh sách ProductResponse, ngược lại trả về null
        return json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : null;
    }

    // Hàm này tính count các sản phẩm từ cache Redis
    @Override
    public Long countAllProducts(String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisTemplate.opsForValue().get(key);
        List<ProductResponse> productResponses = json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : null;
        return productResponses != null ? (long) productResponses.size() : 0L;
    }


    // Hàm này lưu tất cả sản phẩm vào cache Redis
    @Override
    public void saveAllProductsToCache(List<ProductResponse> productResponses, String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisObjectMapper.writeValueAsString(productResponses);
        redisTemplate.opsForValue().set(key, json);
    }
}
