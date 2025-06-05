import { Injectable } from '@angular/core';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TokenService } from './token.service';

/**
 * Service tiện ích cung cấp các chức năng hỗ trợ cho HTTP requests
 *
 * Service này tập trung hóa việc tạo và quản lý các HTTP headers,
 * xử lý lỗi HTTP, và các tiện ích khác liên quan đến HTTP requests
 * để đảm bảo tính nhất quán trong toàn bộ ứng dụng.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpUtilService {
  /**
   * Ngôn ngữ mặc định được sử dụng cho headers
   */
  private defaultLanguage = 'vi';

  /**
   * Constructor với TokenService được inject để lấy JWT token khi cần
   *
   * @param tokenService - Service để quản lý JWT token
   */
  constructor(private tokenService: TokenService) { }

  /**
   * Tạo và trả về đối tượng HttpHeaders với các giá trị mặc định
   * được cấu hình cho toàn bộ ứng dụng
   *
   * @param includeContentType - Cờ xác định có thêm header Content-Type không (mặc định: true)
   * @returns HttpHeaders - Đối tượng headers với các thiết lập chuẩn
   */
  createHeaders(includeContentType = true): HttpHeaders {
    let headers = new HttpHeaders();

    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return headers.set('Accept-Language', this.defaultLanguage);
  }

  /**
   * Tạo headers với JWT token xác thực
   *
   * @param includeContentType - Cờ xác định có thêm header Content-Type không (mặc định: true)
   * @returns HttpHeaders - Headers với token xác thực
   */
  createAuthHeaders(includeContentType = true): HttpHeaders {
    const token = this.tokenService.getToken();
    let headers = this.createHeaders(includeContentType);

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Tạo headers cho việc upload file
   * Lưu ý: Không thiết lập Content-Type vì browser sẽ tự động thiết lập
   * với boundary đúng cho multipart/form-data
   *
   * @returns HttpHeaders - Headers phù hợp cho upload file
   */
  createFileUploadHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    let headers = new HttpHeaders().set('Accept-Language', this.defaultLanguage);

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Xử lý lỗi HTTP và trả về một Observable chứa lỗi
   *
   * @param error - Lỗi HTTP nhận được
   * @returns Observable - Observable chứa thông tin lỗi đã được xử lý
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định';

    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Lỗi phía server
      errorMessage = `Mã lỗi: ${error.status}, Thông báo: ${error.message}`;

      // Xử lý các mã lỗi cụ thể
      switch (error.status) {
        case 401:
          errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
          break;
        case 403:
          errorMessage = 'Không có quyền thực hiện hành động này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Thiết lập ngôn ngữ mặc định cho headers
   *
   * @param language - Mã ngôn ngữ (ví dụ: 'vi', 'en')
   */
  setDefaultLanguage(language: string): void {
    this.defaultLanguage = language;
  }
}
