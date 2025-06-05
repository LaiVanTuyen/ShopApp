import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {DOCUMENT, NgClass} from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Models
import { Product } from '../../models/products';
import { Category } from '../../models/category';

// Services
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../environments/environment';
import {FormsModule} from '@angular/forms';
import {FooterComponent} from '../footer/footer.component';
import {HeaderComponent} from '../header/header.component';

/**
 * Interface for API response containing products and pagination data
 * This can be used for type checking but we handle both possible response formats in the code
 */
interface ProductResponse {
  products: Product[];
  totalPages: number;
}

// Note: The actual API might return either:
// 1. An array of products: Product[]
// 2. An object with products and pagination: { products: Product[], totalPages: number }

/**
 * HomeComponent - Trang chủ hiển thị danh sách sản phẩm và danh mục
 *
 * Component này xử lý:
 * - Hiển thị danh sách sản phẩm với phân trang
 * - Lọc sản phẩm theo danh mục
 * - Tìm kiếm sản phẩm theo từ khóa
 * - Chuyển hướng đến trang chi tiết sản phẩm
 */
@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    NgClass,
    FooterComponent,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Danh sách sản phẩm được hiển thị
  products: Product[] = [];

  // Danh sách danh mục từ CategoryService
  categories: Category[] = [];

  // ID của danh mục được chọn, mặc định là 0 (tất cả)
  selectedCategoryId: number = 0;

  // Phân trang - Trang hiện tại, mặc định là 0
  currentPage: number = 0;

  // Số sản phẩm hiển thị trên mỗi trang
  itemsPerPage: number = 12;

  // Mảng các trang (không sử dụng)
  pages: number[] = [];

  // Tổng số trang
  totalPages: number = 0;

  // Các trang hiển thị trong thanh phân trang
  visiblePages: number[] = [];

  // Từ khóa tìm kiếm
  keyword: string = "";

  // Đối tượng localStorage để lưu trữ dữ liệu cục bộ
  localStorage?: Storage;

  // Quản lý các subscription để tránh memory leak
  private subscriptions: Subscription = new Subscription();

  /**
   * Constructor - Khởi tạo component với các service cần thiết
   *
   * @param productService - Service xử lý dữ liệu sản phẩm
   * @param categoryService - Service xử lý dữ liệu danh mục
   * @param router - Router để điều hướng trang
   * @param tokenService - Service xử lý token xác thực
   * @param document - Tham chiếu đến Document để truy cập localStorage
   */
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private tokenService: TokenService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Khởi tạo localStorage từ document
    this.localStorage = document.defaultView?.localStorage;
  }

  /**
   * Lifecycle hook - Được gọi khi component được khởi tạo
   * Tải dữ liệu ban đầu: sản phẩm và danh mục
   */
  ngOnInit(): void {
    // Lấy trang hiện tại từ localStorage hoặc mặc định là 0
    this.currentPage = Number(this.localStorage?.getItem('currentProductPage')) || 0;

    // Tải danh sách sản phẩm ban đầu
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);

    // Tải danh sách danh mục
    this.getCategories(0, 100);
  }

  /**
   * Lifecycle hook - Được gọi khi component bị hủy
   * Hủy tất cả subscription để tránh memory leak
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lấy danh sách danh mục từ CategoryService
   *
   * @param page - Trang bắt đầu (pagination)
   * @param limit - Số lượng danh mục tối đa trên một trang
   */
  getCategories(page: number, limit: number): void {
    const subscription = this.categoryService.getCategories(page, limit)
      .pipe(
        catchError((error) => {
          console.error('Error fetching categories:', error);
          // Return an empty array as an Observable
          return of([]);
        })
      )
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories;
        }
      });

    this.subscriptions.add(subscription);
  }

  /**
   * Xử lý tìm kiếm sản phẩm khi người dùng nhấn nút tìm kiếm
   * Reset trang về 0 và gọi API để lấy sản phẩm
   */
  searchProducts(): void {
    this.currentPage = 0;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  /**
   * Lấy danh sách sản phẩm từ ProductService với các tham số lọc
   *
   * @param keyword - Từ khóa tìm kiếm
   * @param selectedCategoryId - ID danh mục được chọn để lọc
   * @param page - Trang hiện tại (pagination)
   * @param limit - Số lượng sản phẩm tối đa trên một trang
   */
  getProducts(keyword: string, selectedCategoryId: number, page: number, limit: number): void {
    const subscription = this.productService.getProducts(keyword, selectedCategoryId, page, limit)
      .pipe(
        catchError((error) => {
          console.error('Error fetching products:', error);
          // Return an Observable with an empty result
          // We're using a flexible structure that will work with our updated handler
          return of({ products: [], totalPages: 0 });
        }),
        finalize(() => {
          // Xử lý khi API call hoàn thành (thành công hoặc thất bại)
        })
      )
      .subscribe({
        next: (response: any) => {
          // Xác định cấu trúc phản hồi và xử lý tương ứng
          let products: Product[] = [];
          let totalPages = 0;

          // Kiểm tra cấu trúc phản hồi để xử lý đúng
          if (Array.isArray(response)) {
            // Nếu phản hồi là một mảng (Product[])
            products = response;
            totalPages = 1; // Mặc định là 1 trang nếu không có thông tin phân trang
          } else {
            // Nếu phản hồi là một đối tượng có cấu trúc { products, totalPages }
            products = response.products || [];
            totalPages = response.totalPages || 0;
          }

          // Thêm URL hình ảnh cho mỗi sản phẩm
          products.forEach((product: Product) => {
            product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          });

          // Cập nhật dữ liệu component
          this.products = products;
          this.totalPages = totalPages;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        }
      });

    this.subscriptions.add(subscription);
  }

  /**
   * Xử lý khi người dùng chuyển trang
   *
   * @param page - Số trang mới mà người dùng muốn chuyển đến
   */
  onPageChange(page: number): void {
    // Đảm bảo trang không nhỏ hơn 0
    this.currentPage = page < 0 ? 0 : page;

    // Lưu trang hiện tại vào localStorage để duy trì trạng thái khi tải lại trang
    this.localStorage?.setItem('currentProductPage', String(this.currentPage));

    // Tải lại danh sách sản phẩm với trang mới
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  /**
   * Tạo mảng các trang hiển thị trong thanh phân trang
   * Phương pháp này tạo ra một cửa sổ trượt hiển thị tối đa 5 trang
   * với trang hiện tại nằm ở giữa nếu có thể
   *
   * @param currentPage - Trang hiện tại
   * @param totalPages - Tổng số trang
   * @returns Mảng số nguyên đại diện cho các trang sẽ hiển thị
   */
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    // Số trang tối đa hiển thị cùng lúc
    const maxVisiblePages = 5;
    // Số trang hiển thị ở mỗi bên của trang hiện tại
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    // Tính toán trang bắt đầu và kết thúc của cửa sổ trượt
    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Điều chỉnh startPage nếu cần để đảm bảo hiển thị đủ maxVisiblePages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    // Tạo mảng các trang từ startPage đến endPage
    return new Array(endPage - startPage + 1).fill(0)
      .map((_, index) => startPage + index);
  }

  /**
   * Xử lý sự kiện khi người dùng nhấp vào một sản phẩm
   * Điều hướng đến trang chi tiết sản phẩm
   *
   * @param productId - ID của sản phẩm được chọn
   */
  onProductClick(productId: number): void {
    // Điều hướng đến trang chi tiết sản phẩm với productId là tham số
    this.router.navigate(['/products', productId]);
  }
}
