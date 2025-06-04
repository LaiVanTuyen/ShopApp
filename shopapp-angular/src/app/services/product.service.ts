import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/products';
import { UpdateProductDTO } from '../dtos/product/update.product.dto';
import { InsertProductDTO } from '../dtos/product/insert.product.dto';

/**
 * Service quản lý các thao tác liên quan đến sản phẩm
 *
 * Cung cấp các phương thức để thực hiện các hoạt động CRUD (Create, Read, Update, Delete)
 * với sản phẩm thông qua API.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  /**
   * URL cơ sở của API, được lấy từ cấu hình môi trường
   */
  private apiBaseUrl = environment.apiBaseUrl;

  /**
   * Constructor với HttpClient được inject để thực hiện các yêu cầu HTTP
   */
  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách sản phẩm với các tùy chọn lọc và phân trang
   *
   * @param keyword - Từ khóa tìm kiếm
   * @param categoryId - ID của danh mục cần lọc
   * @param page - Số trang
   * @param limit - Số lượng sản phẩm mỗi trang
   * @returns Observable chứa mảng các sản phẩm
   */
  getProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number
  ): Observable<Product[]> {
    const params = {
      keyword: keyword,
      category_id: categoryId.toString(),
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products`, { params });
  }

  /**
   * Lấy thông tin chi tiết của một sản phẩm theo ID
   *
   * @param productId - ID của sản phẩm cần xem chi tiết
   * @returns Observable chứa thông tin sản phẩm
   */
  getDetailProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiBaseUrl}/products/${productId}`);
  }

  /**
   * Lấy danh sách sản phẩm theo các ID được chỉ định
   *
   * @param productIds - Mảng các ID sản phẩm cần lấy
   * @returns Observable chứa mảng các sản phẩm
   */
  getProductsByIds(productIds: number[]): Observable<Product[]> {
    const params = new HttpParams().set('ids', productIds.join(','));
    return this.http.get<Product[]>(`${this.apiBaseUrl}/products/by-ids`, { params });
  }

  /**
   * Xóa một sản phẩm theo ID
   *
   * @param productId - ID của sản phẩm cần xóa
   * @returns Observable chứa thông báo xác nhận
   */
  deleteProduct(productId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseUrl}/products/${productId}`);
  }

  /**
   * Cập nhật thông tin của một sản phẩm
   *
   * @param productId - ID của sản phẩm cần cập nhật
   * @param updatedProduct - DTO chứa thông tin cập nhật
   * @returns Observable chứa sản phẩm đã được cập nhật
   */
  updateProduct(productId: number, updatedProduct: UpdateProductDTO): Observable<Product> {
    return this.http.put<Product>(`${this.apiBaseUrl}/products/${productId}`, updatedProduct);
  }

  /**
   * Thêm mới một sản phẩm vào hệ thống
   *
   * @param insertProductDTO - DTO chứa thông tin sản phẩm mới
   * @returns Observable chứa sản phẩm đã được tạo
   */
  insertProduct(insertProductDTO: InsertProductDTO): Observable<Product> {
    return this.http.post<Product>(`${this.apiBaseUrl}/products`, insertProductDTO);
  }

  /**
   * Tải lên nhiều ảnh cho một sản phẩm
   *
   * @param productId - ID của sản phẩm cần tải ảnh
   * @param files - Mảng các file ảnh cần tải lên
   * @returns Observable chứa kết quả tải lên
   */
  uploadImages(productId: number, files: File[]): Observable<{ message: string }> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/products/uploads/${productId}`, formData);
  }

  /**
   * Xóa một ảnh của sản phẩm
   *
   * @param id - ID của ảnh sản phẩm cần xóa
   * @returns Observable chứa thông báo xác nhận
   */
  deleteProductImage(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseUrl}/product_images/${id}`);
  }
}
