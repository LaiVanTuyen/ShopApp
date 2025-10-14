package com.project.shopapp.services;

import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductImageDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.exceptions.InvalidParamException;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductImage;
import com.project.shopapp.repositories.CategoryRepository;
import com.project.shopapp.repositories.ProductImageRepository;
import com.project.shopapp.repositories.ProductRepository;
import com.project.shopapp.repositories.ProductHolidayDiscountRepository;
import com.project.shopapp.responses.ProductResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductHolidayDiscountRepository productHolidayDiscountRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public Product createProduct(ProductDTO productDTO) throws DataNotFoundException {
        Category existingCategory = categoryRepository
                .findById(productDTO.getCategoryId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: " + productDTO.getCategoryId()));

        Product newProduct = Product.builder()
                .name(productDTO.getName())
                .price(productDTO.getPrice())
                .thumbnail(productDTO.getThumbnail())
                .description(productDTO.getDescription())
                .category(existingCategory)
                .build();
        return productRepository.save(newProduct);
    }

    @Override
    public Product getProductById(long productId) throws Exception {
        Optional<Product> optionalProduct = productRepository.getDetailProduct(Long.valueOf(productId));
        if (optionalProduct.isPresent()) {
            return optionalProduct.get();
        }
        throw new DataNotFoundException("Cannot find product with id =" + productId);
    }

    @Override
    public List<Product> findProductsByIds(List<Long> productIds) {
        return productRepository.findProductsByIds(productIds);
    }

    @Override
    public Page<ProductResponse> getFeaturedProducts(String keyword, Long categoryId, PageRequest pageRequest) {
        // Lấy danh sách sản phẩm nổi bật theo trang (page), giới hạn (limit), và categoryId (nếu có)
        Page<Product> productsPage = productRepository.searchFeaturedProducts(categoryId, keyword, pageRequest);
        Date currentDate = Date.valueOf(LocalDate.now());
        List<ProductResponse> responses = productsPage.getContent().stream().map(product -> {
            ProductResponse resp = ProductResponse.fromProduct(product);
            resp.setActualSalePercent(calculateActualSalePercent(product, currentDate));
            return resp;
        }).toList();
        return new PageImpl<>(responses, pageRequest, productsPage.getTotalElements());
    }

    @Override
    public List<ProductResponse> getLatestProducts(String keyword, Long categoryId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.searchLatestProducts(categoryId, keyword, pageable);
        Date currentDate = Date.valueOf(LocalDate.now());
        return products.stream().map(product -> {
            ProductResponse resp = ProductResponse.fromProduct(product);
            resp.setActualSalePercent(calculateActualSalePercent(product, currentDate));
            return resp;
        }).toList();
    }

    @Override
    public Page<ProductResponse> getAllProducts(String keyword,
                                                Long categoryId, PageRequest pageRequest, Float minPrice, Float maxPrice) {
        // Lấy danh sách sản phẩm theo trang (page), giới hạn (limit), và categoryId (nếu có) và khoảng giá (nếu có)
        Page<Product> productsPage = productRepository.searchProducts(categoryId, keyword, pageRequest, minPrice, maxPrice);
        Date currentDate = Date.valueOf(LocalDate.now());
        List<ProductResponse> responses = productsPage.getContent().stream().map(product -> {
            ProductResponse resp = ProductResponse.fromProduct(product);
            resp.setActualSalePercent(calculateActualSalePercent(product, currentDate));
            return resp;
        }).toList();
        return new PageImpl<>(responses, pageRequest, productsPage.getTotalElements());
    }

    @Override
    @Transactional
    public Product updateProduct(
            long id,
            ProductDTO productDTO
    )
            throws Exception {
        Product existingProduct = getProductById(id);
        if (existingProduct != null) {
            //copy các thuộc tính từ DTO -> Product
            //Có thể sử dụng ModelMapper
            Category existingCategory = categoryRepository
                    .findById(productDTO.getCategoryId())
                    .orElseThrow(() ->
                            new DataNotFoundException(
                                    "Cannot find category with id: " + productDTO.getCategoryId()));
            existingProduct.setName(productDTO.getName());
            existingProduct.setCategory(existingCategory);
            existingProduct.setPrice(productDTO.getPrice());
            existingProduct.setDescription(productDTO.getDescription());
            existingProduct.setThumbnail(productDTO.getThumbnail());
            return productRepository.save(existingProduct);
        }
        return null;

    }

    @Override
    @Transactional
    public void deleteProduct(long id) {
        Optional<Product> optionalProduct = productRepository.findById(Long.valueOf(id));
        optionalProduct.ifPresent(productRepository::delete);
    }

    @Override
    public boolean existsByName(String name) {
        return productRepository.existsByName(name);
    }

    @Override
    @Transactional
    public ProductImage createProductImage(
            Long productId,
            ProductImageDTO productImageDTO) throws Exception {
        Product existingProduct = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find product with id: " + productImageDTO.getProductId()));
        ProductImage newProductImage = ProductImage.builder()
                .product(existingProduct)
                .imageUrl(productImageDTO.getImageUrl())
                .build();
        //Ko cho insert quá 5 ảnh cho 1 sản phẩm
        int size = productImageRepository.findByProductId(productId).size();
        if (size >= ProductImage.MAXIMUM_IMAGES_PER_PRODUCT) {
            throw new InvalidParamException(
                    "Number of images must be <= "
                            + ProductImage.MAXIMUM_IMAGES_PER_PRODUCT);
        }
        return productImageRepository.save(newProductImage);
    }

    @Override
    public Page<ProductResponse> getTopRatedProducts(PageRequest pageRequest) {
        Page<Product> productsPage = productRepository.findTopRatedProducts(pageRequest);
        return productsPage.map(ProductResponse::fromProduct);
    }

    @Override
    public Page<ProductResponse> getTopSalesProducts(PageRequest pageRequest) {
        Date currentDate = Date.valueOf(LocalDate.now());
        List<Object[]> results = productRepository.findTopSalesProducts(currentDate, pageRequest);
        List<ProductResponse> responses = new java.util.ArrayList<>();
        for (Object[] row : results) {
            Long productId = ((Number) row[0]).longValue();
            Product product = entityManager.getReference(Product.class, productId);
            ProductResponse resp = ProductResponse.fromProduct(product);
            resp.setActualSalePercent(calculateActualSalePercent(product, currentDate));
            responses.add(resp);
        }
        int total = responses.size();
        return new PageImpl<>(responses, pageRequest, total);
    }

    public Double calculateActualSalePercent(Product product, Date currentDate) {
        Double discount = productHolidayDiscountRepository.findDiscountPercentByProductIdAndDate(product.getId(), currentDate);
        if (discount != null) {
            return discount;
        }
        return product.getSalePercent() != null ? product.getSalePercent().doubleValue() : null;
    }

}
