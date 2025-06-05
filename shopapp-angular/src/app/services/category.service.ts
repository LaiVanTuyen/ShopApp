import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Category } from '../models/category';
import { UpdateCategoryDTO } from '../dtos/category/update.category.dto';
import { InsertCategoryDTO } from '../dtos/category/insert.category.dto';
import { HttpUtilService } from './http.util.service';

/**
 * Service quản lý các thao tác liên quan đến danh mục sản phẩm
 *
 * Cung cấp các phương thức để thực hiện các hoạt động CRUD (Create, Read, Update, Delete)
 * với danh mục sản phẩm thông qua REST API.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  /**
   * URL cơ sở của API, được lấy từ cấu hình môi trường
   */
  private apiBaseUrl = environment.apiBaseUrl;

  /**
   * Constructor với các services cần thiết được inject
   *
   * @param http - HttpClient service để gửi HTTP requests
   * @param httpUtilService - Service tiện ích để tạo HTTP headers nhất quán
   */
  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService
  ) { }

  /**
   * Lấy danh sách danh mục sản phẩm với phân trang
   *
   * @param page - Số trang cần hiển thị
   * @param limit - Số lượng danh mục tối đa trên mỗi trang
   * @returns Observable chứa mảng các danh mục
   */
  getCategories(page: number, limit: number): Observable<Category[]> {
    const url = `${this.apiBaseUrl}/categories`;
    const headers = this.httpUtilService.createHeaders();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<Category[]>(url, { headers, params })
      .pipe(
        catchError(this.httpUtilService.handleError)
      );
  }

  /**
   * Lấy thông tin chi tiết của một danh mục theo ID
   *
   * @param categoryId - ID của danh mục cần xem chi tiết
   * @returns Observable chứa thông tin danh mục
   */
  getDetailCategory(categoryId: number): Observable<Category> {
    const url = `${this.apiBaseUrl}/categories/${categoryId}`;
    const headers = this.httpUtilService.createHeaders();

    return this.http.get<Category>(url, { headers })
      .pipe(
        catchError(this.httpUtilService.handleError)
      );
  }

  /**
   * Xóa một danh mục theo ID
   *
   * @param categoryId - ID của danh mục cần xóa
   * @returns Observable chứa thông báo xác nhận
   */
  deleteCategory(categoryId: number): Observable<string> {
    const url = `${this.apiBaseUrl}/categories/${categoryId}`;
    const headers = this.httpUtilService.createHeaders();

    return this.http.delete<string>(url, { headers })
      .pipe(
        catchError(this.httpUtilService.handleError)
      );
  }

  /**
   * Cập nhật thông tin của một danh mục
   *
   * @param categoryId - ID của danh mục cần cập nhật
   * @param updatedCategory - DTO chứa thông tin cập nhật
   * @returns Observable chứa danh mục đã được cập nhật
   */
  updateCategory(categoryId: number, updatedCategory: UpdateCategoryDTO): Observable<Category> {
    const url = `${this.apiBaseUrl}/categories/${categoryId}`;
    const headers = this.httpUtilService.createHeaders();

    return this.http.put<Category>(url, updatedCategory, { headers })
      .pipe(
        catchError(this.httpUtilService.handleError)
      );
  }

  /**
   * Thêm mới một danh mục vào hệ thống
   *
   * @param newCategory - DTO chứa thông tin danh mục mới
   * @returns Observable chứa danh mục đã được tạo
   */
  insertCategory(newCategory: InsertCategoryDTO): Observable<Category> {
    const url = `${this.apiBaseUrl}/categories`;
    const headers = this.httpUtilService.createHeaders();

    return this.http.post<Category>(url, newCategory, { headers })
      .pipe(
        catchError(this.httpUtilService.handleError)
      );
  }
}
