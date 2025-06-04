import {Inject, Injectable} from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import {DOCUMENT} from '@angular/common';

/**
 * Service quản lý JWT token xác thực
 *
 * Service này cung cấp các phương thức để lưu trữ, truy xuất và xác thực JWT token
 * dùng cho xác thực người dùng. Service này tương tác với localStorage của trình duyệt
 * và sử dụng JwtHelperService để giải mã và xác thực token.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  /**
   * Khóa dùng để lưu JWT token trong localStorage
   * Sử dụng readonly để ngăn chặn việc vô tình thay đổi giá trị
   */
  private readonly TOKEN_KEY = 'access_token';

  /**
   * Service hỗ trợ cung cấp các chức năng liên quan đến JWT
   * như giải mã token và kiểm tra hết hạn
   */
  private readonly jwtHelperService = new JwtHelperService();

  /**
   * Tham chiếu đến API localStorage của trình duyệt
   * Sử dụng dấu ? vì có thể không khả dụng trong một số môi trường
   */
  private localStorage?: Storage;

  /**
   * Khởi tạo một instance của TokenService
   *
   * @param document - Đối tượng Document được inject để truy cập API trình duyệt
   */
  constructor(@Inject(DOCUMENT) private document: Document) {
    // Truy cập an toàn localStorage thông qua document.defaultView
    this.localStorage = document.defaultView?.localStorage;
  }

  /**
   * Lấy JWT token đã lưu từ localStorage
   *
   * @returns Token dưới dạng chuỗi, hoặc chuỗi rỗng nếu không tìm thấy
   */
  getToken(): string {
    return this.localStorage?.getItem(this.TOKEN_KEY) ?? '';
  }

  /**
   * Lưu JWT token vào localStorage
   *
   * @param token - Chuỗi JWT token cần lưu trữ
   */
  setToken(token: string): void {
    this.localStorage?.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Trích xuất ID người dùng từ payload của JWT token
   *
   * @returns ID người dùng dưới dạng số, hoặc 0 nếu token không hợp lệ hoặc không tồn tại
   */
  getUserId(): number {
    const token = this.getToken();
    if (!token) {
      return 0;
    }

    try {
      const userObject = this.jwtHelperService.decodeToken(token);
      return userObject && 'userId' in userObject ? parseInt(userObject['userId'], 10) : 0;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return 0;
    }
  }

  /**
   * Xóa JWT token khỏi localStorage
   * Thường được sử dụng khi đăng xuất
   */
  removeToken(): void {
    this.localStorage?.removeItem(this.TOKEN_KEY);
  }

  /**
   * Kiểm tra xem JWT token đã lưu có hết hạn chưa
   *
   * @returns True nếu token tồn tại và đã hết hạn, ngược lại trả về false
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return this.jwtHelperService.isTokenExpired(token);
  }
}
