import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService, Product } from './service/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  productId: string = '';
  product: Product | null = null;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;

  constructor(private searchService: SearchService) {}

  search() {
    this.clearMessages();
    if (!this.productId.trim()) {
      this.error = 'Please enter a valid product ID.';
      return;
    }

    this.isLoading = true;

    this.searchService.searchByProductId(this.productId.trim()).subscribe({
      next: (result) => {
        this.product = result;
        this.success = 'Product found.';
        this.isLoading = false;
      },
      error: () => {
        this.product = null;
        this.error = 'Product not found or invalid ID.';
        this.isLoading = false;
      }
    });
  }

  saveSearch() {
    this.clearMessages();

    if (!this.product?._id) {
      this.error = 'No product to save.';
      return;
    }

    this.searchService.saveSearch(this.product._id).subscribe({
      next: () => {
        this.success = 'Search saved successfully.';
      },
      error: () => {
        this.error = 'Could not save this search.';
      }
    });
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }
}
