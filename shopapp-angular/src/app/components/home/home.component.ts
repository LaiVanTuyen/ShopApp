import {Component, OnInit} from '@angular/core';
import {Product} from '../../models/products';
import {Category} from '../../models/category';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  currentPage: number = 0;
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages:number = 0;
  visiblePages: number[] = [];
  keyword:string = "";
  localStorage?:Storage;


  constructor(

  ) {}

  ngOnInit(): void {
    // Initialization logic here
  }

  // Add any additional methods or properties as needed

}
