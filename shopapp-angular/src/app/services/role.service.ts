import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

/**
 * Service quản lý các vai trò (roles) trong hệ thống
 *
 * Service này cung cấp các phương thức để tương tác với API về vai trò người dùng,
 * như lấy danh sách vai trò từ server.
 */
@Injectable({
  providedIn: 'root' // Service được đăng ký ở root level, có thể sử dụng ở mọi nơi trong ứng dụng
})
export class RoleService {
  /**
   * URL endpoint để lấy danh sách vai trò từ API
   *
   * Sử dụng biến environment.apiBaseUrl để đảm bảo URL đúng cho mỗi môi trường
   * (development, production, testing)
   */
  private apiGetRoles = `${environment.apiBaseUrl}/roles`;

  /**
   * Khởi tạo RoleService
   *
   * @param http - HttpClient được inject, dùng để thực hiện các HTTP request
   */
  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả vai trò từ API
   *
   * Phương thức này gửi HTTP GET request đến API endpoint và trả về
   * một Observable chứa mảng dữ liệu về vai trò.
   *
   * @returns Observable<any> - Observable chứa dữ liệu vai trò
   * Lưu ý: Nên định nghĩa một interface Role cụ thể thay vì sử dụng any
   */
  getRoles(): Observable<any> {
    return this.http.get<any[]>(this.apiGetRoles);
  }
}
