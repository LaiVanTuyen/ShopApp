import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';

/**
 * Component hiển thị thanh điều hướng và thông tin người dùng
 *
 * Component này quản lý phần header của ứng dụng, bao gồm điều hướng,
 * hiển thị trạng thái đăng nhập và cung cấp các tùy chọn người dùng.
 */
@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * Thông tin người dùng đang đăng nhập
   * Giá trị null khi chưa đăng nhập hoặc đã đăng xuất
   */
  userResponse: UserResponse | null = null;

  /**
   * Trạng thái hiển thị của popover menu
   */
  isPopoverOpen = false;

  /**
   * Chỉ mục của mục điều hướng đang được chọn
   * - 0: Trang chủ
   * - 1: Thông báo
   * - 2: Giỏ hàng
   */
  activeNavItem = 0;

  /**
   * Theo dõi các subscription để hủy khi component bị hủy
   */
  private subscriptions: Subscription[] = [];

  /**
   * Khởi tạo HeaderComponent
   *
   * @param userService - Service quản lý thông tin người dùng
   * @param tokenService - Service quản lý token xác thực
   * @param router - Service điều hướng Angular
   */
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  /**
   * Khởi tạo component, lấy thông tin người dùng từ localStorage
   */
  ngOnInit(): void {
    this.loadUserData();

    // Thêm event listener để đóng popover khi click bên ngoài
    this.addClickOutsideListener();
  }

  /**
   * Dọn dẹp khi component bị hủy để tránh memory leak
   */
  ngOnDestroy(): void {
    // Hủy tất cả các subscription
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Xóa event listener khi component bị hủy
    this.removeClickOutsideListener();
  }

  /**
   * Thêm event listener để đóng popover khi click bên ngoài
   */
  private addClickOutsideListener(): void {
    // Đăng ký event listener document click để đóng popover khi click bên ngoài
    document.addEventListener('click', this.handleClickOutside);
  }

  /**
   * Xóa event listener khi component bị hủy
   */
  private removeClickOutsideListener(): void {
    document.removeEventListener('click', this.handleClickOutside);
  }

  /**
   * Xử lý sự kiện click bên ngoài dropdown
   */
  private handleClickOutside = (event: MouseEvent): void => {
    // Kiểm tra nếu popover đang mở
    if (this.isPopoverOpen) {
      // Nếu click không phải trong dropdown, đóng popover
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        this.isPopoverOpen = false;
      }
    }
  }

  /**
   * Tải thông tin người dùng từ localStorage
   */
  private loadUserData(): void {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }

  /**
   * Chuyển đổi trạng thái hiển thị của menu popup
   *
   * @param event - Sự kiện DOM kích hoạt phương thức này
   */
  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  /**
   * Xử lý các hành động khi người dùng nhấp vào mục trong menu
   *
   * @param index - Chỉ mục của mục được nhấp
   *  - 0: Tài khoản của tôi
   *  - 1: Đơn mua
   *  - 2: Đăng xuất
   */
  handleItemClick(index: number): void {
    switch (index) {
      case 0:
        // Chuyển đến trang thông tin tài khoản
        this.router.navigate(['/user-profile']);
        break;
      case 1:
        // Chuyển đến trang đơn hàng
        this.router.navigate(['/orders']);
        break;
      case 2:
        // Đăng xuất: xóa thông tin người dùng và token
        this.logout();
        break;
      default:
        console.warn(`Không xử lý được hành động có chỉ mục: ${index}`);
    }

    // Đóng popover sau khi thực hiện hành động
    this.isPopoverOpen = false;
  }

  /**
   * Xử lý đăng xuất người dùng
   */
  private logout(): void {
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = null;

    // Chuyển hướng về trang chủ sau khi đăng xuất
    this.router.navigate(['/']);
  }

  /**
   * Thiết lập mục điều hướng đang hoạt động
   *
   * @param index - Chỉ mục của mục điều hướng cần kích hoạt
   */
  setActiveNavItem(index: number): void {
    this.activeNavItem = index;
  }

  /**
   * Kiểm tra xem người dùng đã đăng nhập chưa
   *
   * @returns true nếu người dùng đã đăng nhập, ngược lại false
   */
  isLoggedIn(): boolean {
    return this.userResponse !== null;
  }
}
