import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Service quản lý giỏ hàng của người dùng
 *
 * Service này lưu trữ và quản lý thông tin giỏ hàng của người dùng, sử dụng localStorage
 * để duy trì dữ liệu giữa các phiên làm việc. Mỗi người dùng có một giỏ hàng riêng biệt
 * dựa trên ID người dùng.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  /**
   * Giỏ hàng được lưu trữ dưới dạng Map
   * - Key: ID sản phẩm (number)
   * - Value: Số lượng sản phẩm (number)
   */
  private cart: Map<number, number> = new Map<number, number>();

  /**
   * Tham chiếu đến localStorage của trình duyệt
   * Được khai báo optional để tương thích với các môi trường không có localStorage
   */
  private localStorage?: Storage;

  /**
   * Khóa mặc định cho giỏ hàng khi không có thông tin người dùng
   */
  private readonly DEFAULT_CART_KEY = 'cart:guest';

  /**
   * Khởi tạo CartService
   *
   * @param document - Document được inject từ Angular để truy cập localStorage an toàn
   */
  constructor(@Inject(DOCUMENT) private document: Document) {
    // Truy cập an toàn localStorage thông qua document.defaultView
    this.localStorage = document.defaultView?.localStorage;

    // Khởi tạo giỏ hàng từ dữ liệu đã lưu trong localStorage
    this.refreshCart();
  }

  /**
   * Tải lại dữ liệu giỏ hàng từ localStorage
   *
   * Phương thức này được gọi khi khởi tạo service và nên được gọi sau khi
   * đăng nhập/đăng xuất để cập nhật giỏ hàng theo người dùng hiện tại
   */
  public refreshCart(): void {
    try {
      const storedCart = this.localStorage?.getItem(this.getCartKey());
      if (storedCart) {
        this.cart = new Map(JSON.parse(storedCart));
      } else {
        this.cart = new Map<number, number>();
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu giỏ hàng:', error);
      this.cart = new Map<number, number>();
    }
  }

  /**
   * Tạo khóa duy nhất cho giỏ hàng dựa trên ID người dùng
   *
   * @returns Chuỗi định danh giỏ hàng
   */
  private getCartKey(): string {
    try {
      const userResponseJSON = this.localStorage?.getItem('user');
      if (!userResponseJSON) {
        return this.DEFAULT_CART_KEY;
      }

      const userResponse = JSON.parse(userResponseJSON);
      return `cart:${userResponse?.id ?? 'guest'}`;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return this.DEFAULT_CART_KEY;
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng hoặc tăng số lượng nếu đã tồn tại
   *
   * @param productId - ID của sản phẩm cần thêm
   * @param quantity - Số lượng sản phẩm cần thêm (mặc định: 1)
   */
  public addToCart(productId: number, quantity: number = 1): void {
    if (productId <= 0 || quantity <= 0) {
      console.warn('ID sản phẩm hoặc số lượng không hợp lệ');
      return;
    }

    const currentQuantity = this.cart.get(productId) || 0;
    this.cart.set(productId, currentQuantity + quantity);

    this.saveCartToLocalStorage();
  }

  /**
   * Cập nhật số lượng của sản phẩm trong giỏ hàng
   *
   * @param productId - ID của sản phẩm cần cập nhật
   * @param quantity - Số lượng mới
   * @returns boolean - true nếu cập nhật thành công, false nếu không tìm thấy sản phẩm
   */
  public updateQuantity(productId: number, quantity: number): boolean {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    if (!this.cart.has(productId)) {
      return false;
    }

    this.cart.set(productId, quantity);
    this.saveCartToLocalStorage();
    return true;
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   *
   * @param productId - ID của sản phẩm cần xóa
   * @returns boolean - true nếu xóa thành công, false nếu không tìm thấy sản phẩm
   */
  public removeFromCart(productId: number): boolean {
    const result = this.cart.delete(productId);
    if (result) {
      this.saveCartToLocalStorage();
    }
    return result;
  }

  /**
   * Lưu trữ giỏ hàng vào localStorage
   */
  private saveCartToLocalStorage(): void {
    try {
      const cartData = JSON.stringify(Array.from(this.cart.entries()));
      this.localStorage?.setItem(this.getCartKey(), cartData);
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng vào localStorage:', error);
    }
  }

  /**
   * Lấy giỏ hàng hiện tại
   *
   * @returns Map chứa thông tin giỏ hàng (ID sản phẩm => số lượng)
   */
  public getCart(): Map<number, number> {
    return new Map(this.cart);
  }

  /**
   * Thay thế toàn bộ giỏ hàng với dữ liệu mới
   *
   * @param cart - Map chứa dữ liệu giỏ hàng mới
   */
  public setCart(cart: Map<number, number> | null): void {
    this.cart = cart ?? new Map<number, number>();
    this.saveCartToLocalStorage();
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  public clearCart(): void {
    this.cart.clear();
    this.saveCartToLocalStorage();
  }

  /**
   * Lấy tổng số lượng sản phẩm trong giỏ hàng
   *
   * @returns Tổng số lượng sản phẩm
   */
  public getTotalItems(): number {
    return Array.from(this.cart.values()).reduce((sum, quantity) => sum + quantity, 0);
  }

  /**
   * Kiểm tra xem giỏ hàng có trống không
   *
   * @returns true nếu giỏ hàng không có sản phẩm nào
   */
  public isEmpty(): boolean {
    return this.cart.size === 0;
  }
}
