import { Component, OnInit } from '@angular/core';
import { Category, UsercategoryService } from '../../services/usercategory.service';
import { FarmService } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer',
  templateUrl: './userfarmer.component.html',
  imports: [FormsModule, CommonModule]
})
export class UserfarmerComponent implements OnInit {
  product = {
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  };

  products: any[] = [];
  categories: Category[] = [];
  editingProduct: any = null;

  constructor(
    private categoryService: UsercategoryService,
    private farmService: FarmService
  ) {}

  ngOnInit() {
    this.fetchProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: cats => this.categories = cats,
      error: err => console.error('Error loading categories:', err)
    });
  }

  fetchProducts() {
    this.farmService.getAllProducts().subscribe({
      next: data => this.products = data,
      error: err => console.error('Error fetching products:', err)
    });
  }

  postProduct() {
    const payload = {
      ...this.product,
      status: 'Available'
    };

    this.farmService.addProduct(payload).subscribe({
      next: res => {
        this.products.unshift(res);
        this.product = { name: '', category: '', quantity: 0, price: 0, description: '' };
      },
      error: err => console.error('Error posting product:', err)
    });
  }

  markAsSold(id: string) {
    this.farmService.markAsSold(id).subscribe({
      next: () => {
        const item = this.products.find(p => p._id === id);
        if (item) item.status = 'Sold';
      },
      error: err => console.error('Error marking as sold:', err)
    });
  }

  deleteProduct(id: string) {
    this.farmService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
      },
      error: err => console.error('Error deleting product:', err)
    });
  }

  startEdit(prod: any) {
    this.editingProduct = { ...prod };
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  updateProduct() {
    if (!this.editingProduct) return;

    this.farmService.updateProduct(this.editingProduct._id, this.editingProduct).subscribe({
      next: updated => {
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index > -1) this.products[index] = updated;
        this.editingProduct = null;
      },
      error: err => console.error('Error updating product:', err)
    });
  }
}
