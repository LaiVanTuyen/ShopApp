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

    /**
     * Hàm tạo key cho cache sản phẩm thường.
     * Key bao gồm: keyword, categoryId, pageNumber, pageSize, sortProperty, sortDirection.
     * Giúp phân biệt cache theo từng truy vấn khác nhau.
     */
    private String getKeyFrom(String keyword,
                              Long categoryId,
                              PageRequest pageRequest) {
        int pageNumber = pageRequest.getPageNumber();
        int pageSize = pageRequest.getPageSize();
        // Lấy thông tin sort đầu tiên (nếu có), nếu không thì mặc định là id ASC
        Sort.Order order = pageRequest.getSort().stream().findFirst().orElse(Sort.Order.asc("id"));
        String sortProperty = order.getProperty();
        String sortDirection = order.getDirection().name();
        return String.format("all_products:%s:%s:%d:%d:%s:%s",
                keyword != null ? keyword : "",
                categoryId != null ? categoryId : "",
                pageNumber, pageSize, sortProperty, sortDirection);
    }

    /**
     * Hàm tạo key cho cache sản phẩm nổi bật.
     * Key cũng bao gồm: keyword, categoryId, pageNumber, pageSize, sortProperty, sortDirection.
     * Prefix khác biệt để tránh ghi đè với cache sản phẩm thường.
     */
    private String getFeaturedKeyFrom(String keyword,
                                      Long categoryId,
                                      PageRequest pageRequest) {
        int pageNumber = pageRequest.getPageNumber();
        int pageSize = pageRequest.getPageSize();
        Sort.Order order = pageRequest.getSort().stream().findFirst().orElse(Sort.Order.asc("id"));
        String sortProperty = order.getProperty();
        String sortDirection = order.getDirection().name();
        return String.format("featured_products:%s:%s:%d:%d:%s:%s",
                keyword != null ? keyword : "",
                categoryId != null ? categoryId : "",
                pageNumber, pageSize, sortProperty, sortDirection);
    }

    /**
     * Hàm tạo key cho cache sản phẩm mới nhất.
     * Key bao gồm: keyword, categoryId, limit.
     * Giúp phân biệt cache theo từng truy vấn khác nhau.
     */
    private String getLatestKeyFrom(String keyword, Long categoryId, int limit) {
        return String.format("latest_products:%s:%s:%d",
                keyword != null ? keyword : "",
                categoryId != null ? categoryId : "",
                limit);
    }



    /**
     * Xóa toàn bộ cache trong Redis (cẩn thận khi sử dụng trên môi trường production).
     */
    @Override
    public void clearCache() {
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }

    /**
     * Lấy tất cả sản phẩm từ cache Redis dựa trên key truy vấn.
     * Nếu không có dữ liệu cache thì trả về null.
     */
    @Override
    public List<ProductResponse> getAllProducts(String keyword,
                                                Long categoryId,
                                                PageRequest pageRequest) throws JsonProcessingException {

        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisTemplate.opsForValue().get(key);
        // Nếu json không null, chuyển đổi json thành danh sách ProductResponse, ngược lại trả về null
        return json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : null;
    }

    /**
     * Đếm số lượng sản phẩm từ cache Redis dựa trên key truy vấn.
     * Nếu không có dữ liệu cache thì trả về 0.
     */
    @Override
    public Long countAllProducts(String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisTemplate.opsForValue().get(key);
        List<ProductResponse> productResponses = json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : null;
        return productResponses != null ? (long) productResponses.size() : 0L;
    }


    /**
     * Lưu danh sách sản phẩm vào cache Redis với key truy vấn tương ứng.
     */
    @Override
    public void saveAllProductsToCache(List<ProductResponse> productResponses, String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getKeyFrom(keyword, categoryId, pageRequest);
        String json = redisObjectMapper.writeValueAsString(productResponses);
        redisTemplate.opsForValue().set(key, json);
    }

    /**
     * Lấy danh sách sản phẩm nổi bật từ cache Redis dựa trên key truy vấn.
     * Nếu không có dữ liệu cache thì trả về Collections.emptyList().
     * Ném ngoại lệ ra ngoài để phía controller/service xử lý.
     */
    @Override
    public List<ProductResponse> getFeaturedProducts(String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getFeaturedKeyFrom(keyword, categoryId, pageRequest);
        String json = redisTemplate.opsForValue().get(key);
        return json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : java.util.Collections.emptyList();
    }

    /**
     * Lưu danh sách sản phẩm nổi bật vào cache Redis với key truy vấn tương ứng.
     * Có thể bổ sung TTL nếu muốn cache tự động hết hạn.
     */
    @Override
    public void saveAllFeaturedProductsToCache(List<ProductResponse> productResponses, String keyword, Long categoryId, PageRequest pageRequest) throws JsonProcessingException {
        String key = this.getFeaturedKeyFrom(keyword, categoryId, pageRequest);
        String json = redisObjectMapper.writeValueAsString(productResponses);
        redisTemplate.opsForValue().set(key, json);
        // Nếu muốn set TTL: redisTemplate.opsForValue().set(key, json, 10, java.util.concurrent.TimeUnit.MINUTES);
    }

    @Override
    public List<ProductResponse> getLatestProducts(String keyword, Long categoryId, int limit) throws JsonProcessingException {
        String key = this.getLatestKeyFrom(keyword,categoryId, limit);
        String json = redisTemplate.opsForValue().get(key);
        return json != null ? redisObjectMapper.readValue(json, new TypeReference<List<ProductResponse>>() {}) : java.util.Collections.emptyList();
    }

    @Override
    public void saveAllLatestProductsToCache(List<ProductResponse> productResponses, String keyword, Long categoryId, int limit) throws JsonProcessingException {
        String key = this.getLatestKeyFrom(keyword, categoryId, limit);
        String json = redisObjectMapper.writeValueAsString(productResponses);
        redisTemplate.opsForValue().set(key, json);
    }
}
