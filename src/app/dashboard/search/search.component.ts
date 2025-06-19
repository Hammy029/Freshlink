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

  savedProducts: Product[] = [];

  constructor(private searchService: SearchService) {
    this.loadSavedProducts();
  }

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

  saveToLocal(product: Product) {
    this.clearMessages();

    if (!product?._id) {
      this.error = 'No product to save.';
      return;
    }

    const saved = this.getSavedFromLocal();
    const exists = saved.find(p => p._id === product._id);

    if (exists) {
      this.success = 'Product already saved.';
      return;
    }

    saved.push(product);
    localStorage.setItem('savedProducts', JSON.stringify(saved));
    this.savedProducts = saved;
    this.success = 'Product saved locally.';
  }

  deleteSaved(id: string) {
    const updated = this.savedProducts.filter(p => p._id !== id);
    this.savedProducts = updated;
    localStorage.setItem('savedProducts', JSON.stringify(updated));
  }

  loadSavedProducts() {
    this.savedProducts = this.getSavedFromLocal();
  }

  getSavedFromLocal(): Product[] {
    const data = localStorage.getItem('savedProducts');
    return data ? JSON.parse(data) : [];
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }
}
