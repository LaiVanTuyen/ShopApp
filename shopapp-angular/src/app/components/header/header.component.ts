import {Component, NgModule, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {UserResponse} from '../../responses/user/user.response';
import {UserService} from '../../services/user.service';
import {TokenService} from '../../services/token.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    NgModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent implements OnInit{
  userResponse?:UserResponse | null
  isPopoverOpen = false;
  activeNavItem:number = 0;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
  ) {
  }


  ngOnInit(): void {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }

  /**
   * Toggles the visibility state of the popover menu
   *
   * @param event - The DOM event that triggered this method (e.g. click event)
   * @returns void - This method doesn't return any value
   *
   * This method performs two actions:
   * 1. Prevents the default behavior of the event (e.g. prevents page navigation for links)
   * 2. Toggles the boolean value of isPopoverOpen which controls the visibility of the popover
   */
  togglePopover(event:Event):void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  handleItemClick(index:number):void {
    //alert(`Clicked on "${index}"`);
    if (index == 0){
      debugger;
      this.router.navigate(['/user-profile']);
    }
  }

}
