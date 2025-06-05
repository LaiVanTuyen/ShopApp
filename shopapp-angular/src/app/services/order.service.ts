import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderDTO } from '../dtos/order/order.dto';
import { Observable } from 'rxjs';
import { OrderResponse } from '../responses/order/order.response';
import { HttpUtilService } from './http.util.service';

/**
 * Service quản lý các thao tác liên quan đến đơn hàng
 *
 * Cung cấp các phương thức để thực hiện các hoạt động CRUD (Create, Read, Update, Delete)
 * với đơn hàng thông qua REST API.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
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
   * Tạo đơn hàng mới
   *
   * @param orderData - Dữ liệu của đơn hàng cần tạo (tuân theo cấu trúc OrderDTO)
   * @returns Observable chứa kết quả từ API sau khi tạo đơn hàng
   */
  placeOrder(orderData: OrderDTO): Observable<OrderResponse> {
    const url = `${this.apiBaseUrl}/orders`;
    const headers = this.httpUtilService.createHeaders();
    return this.http.post<OrderResponse>(url, orderData, { headers });
  }

  /**
   * Lấy thông tin chi tiết của một đơn hàng theo ID
   *
   * @param orderId - ID của đơn hàng cần truy vấn
   * @returns Observable chứa thông tin đơn hàng
   */
  getOrderById(orderId: number): Observable<OrderResponse> {
    const url = `${this.apiBaseUrl}/orders/${orderId}`;
    const headers = this.httpUtilService.createHeaders();
    return this.http.get<OrderResponse>(url, { headers });
  }

  /**
   * Lấy danh sách đơn hàng với các tùy chọn tìm kiếm và phân trang
   *
   * @param keyword - Từ khóa tìm kiếm
   * @param page - Số trang cần hiển thị
   * @param limit - Số lượng đơn hàng tối đa trên mỗi trang
   * @returns Observable chứa mảng các đơn hàng thỏa mãn điều kiện tìm kiếm
   */
  getAllOrders(
    keyword: string,
    page: number,
    limit: number
  ): Observable<OrderResponse[]> {
    const url = `${this.apiBaseUrl}/orders/get-orders-by-keyword`;
    const headers = this.httpUtilService.createHeaders();
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrderResponse[]>(url, { headers, params });
  }

  /**
   * Cập nhật thông tin của một đơn hàng
   *
   * @param orderId - ID của đơn hàng cần cập nhật
   * @param orderData - Dữ liệu mới của đơn hàng
   * @returns Observable chứa đơn hàng đã được cập nhật
   */
  updateOrder(orderId: number, orderData: OrderDTO): Observable<OrderResponse> {
    const url = `${this.apiBaseUrl}/orders/${orderId}`;
    const headers = this.httpUtilService.createHeaders();
    return this.http.put<OrderResponse>(url, orderData, { headers });
  }

  /**
   * Xóa một đơn hàng theo ID
   *
   * @param orderId - ID của đơn hàng cần xóa
   * @returns Observable chứa thông báo xác nhận
   */
  deleteOrder(orderId: number): Observable<string> {
    const url = `${this.apiBaseUrl}/orders/${orderId}`;
    const headers = this.httpUtilService.createHeaders();
    return this.http.delete<string>(url, { headers, responseType: 'text' as 'json' });
  }
}
