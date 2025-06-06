import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';
import { ProductImage } from '../../models/product.image';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Component hiển thị chi tiết sản phẩm, bao gồm hình ảnh, thông tin và chức năng mua hàng
 */
@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    HeaderComponent,
    CommonModule,
    NgbModule
  ]
})
export class DetailProductComponent implements OnInit {
  // Thông tin sản phẩm đang xem
  product?: Product;
  // ID của sản phẩm từ URL
  productId: number = 0;
  // Chỉ số của hình ảnh đang hiển thị
  currentImageIndex: number = 0;
  // Số lượng sản phẩm mặc định là 1
  quantity: number = 1;
  // Cờ đánh dấu đã thêm vào giỏ hàng chưa
  isPressedAddToCart: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  /**
   * Khởi tạo component, lấy thông tin sản phẩm từ API
   */
  ngOnInit() {
    // Lấy productId từ URL
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');

    if (idParam !== null) {
      this.productId = +idParam;
    }

    if (!isNaN(this.productId)) {
      this.loadProductDetails();
    } else {
      console.error('ID sản phẩm không hợp lệ:', idParam);
    }
  }

  /**
   * Tải thông tin chi tiết sản phẩm từ API
   */
  loadProductDetails() {
    this.productService.getDetailProduct(this.productId).subscribe({
      next: (response: any) => {
        // Xử lý URL hình ảnh sản phẩm
        if (response.product_images && response.product_images.length > 0) {
          response.product_images.forEach((product_image: ProductImage) => {
            // Kiểm tra xem URL đã chứa tiền tố API chưa, tránh lặp lại
            if (!product_image.image_url.startsWith('http') &&
                !product_image.image_url.includes(environment.apiBaseUrl)) {
              product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
            }
          });
        }

        this.product = response;
        // Hiển thị hình ảnh đầu tiên
        this.showImage(0);
      },
      error: (error: any) => {
        console.error('Lỗi khi tải thông tin sản phẩm:', error);
      }
    });
  }

  /**
   * Hiển thị hình ảnh theo chỉ số
   * @param index Chỉ số của hình ảnh cần hiển thị
   */
  showImage(index: number): void {
    if (this.product?.product_images?.length) {
      // Đảm bảo index nằm trong khoảng hợp lệ
      if (index < 0) {
        index = 0;
      } else if (index >= this.product.product_images.length) {
        index = this.product.product_images.length - 1;
      }

      // Cập nhật chỉ số hình ảnh hiện tại
      this.currentImageIndex = index;
    }
  }

  /**
   * Xử lý sự kiện click vào hình thu nhỏ
   * @param index Chỉ số của hình ảnh được chọn
   */
  thumbnailClick(index: number): void {
    // Cập nhật chỉ số hình ảnh hiện tại
    this.currentImageIndex = index;
  }

  /**
   * Chuyển đến hình ảnh tiếp theo
   */
  nextImage(): void {
    this.showImage(this.currentImageIndex + 1);
  }

  /**
   * Quay lại hình ảnh trước đó
   */
  previousImage(): void {
    this.showImage(this.currentImageIndex - 1);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart(): void {
    this.isPressedAddToCart = true;
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity);
    } else {
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì chưa tải được thông tin sản phẩm.');
    }
  }

  /**
   * Tăng số lượng sản phẩm
   */
  increaseQuantity(): void {
    this.quantity++;
  }

  /**
   * Giảm số lượng sản phẩm (tối thiểu là 1)
   */
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Tính tổng giá tiền dựa trên số lượng
   * @returns Tổng giá tiền
   */
  getTotalPrice(): number {
    if (this.product) {
      return this.product.price * this.quantity;
    }
    return 0;
  }

  /**
   * Mua ngay sản phẩm (thêm vào giỏ hàng và chuyển đến trang đặt hàng)
   */
  buyNow(): void {
    if (!this.isPressedAddToCart) {
      this.addToCart();
    }
    this.router.navigate(['/orders']);
  }
}
