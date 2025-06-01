import { Component, OnInit } from '@angular/core';
import { Category, UsercategoryService } from '../../services/usercategory.service';
import { FarmService } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer',
  templateUrl: './userfarmer.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class UserfarmerComponent implements OnInit {
  product = {
    title: '',
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
      next: (cats: Category[]) => this.categories = cats,
      error: err => console.error('Error loading categories:', err)
    });
  }

  fetchProducts() {
    this.farmService.getAllProducts().subscribe({
      next: (data: any[]) => {
        this.products = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'  // Default status
        }));
      },
      error: err => console.error('Error fetching products:', err)
    });
  }

  postProduct() {
    const farmerId = localStorage.getItem('userId');
    if (!farmerId) {
      console.error('Farmer ID not found in localStorage.');
      return;
    }

    const payload = {
      title: this.product.title,
      description: this.product.description,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity),
      category: this.product.category,
      farm: farmerId,
      status: 'Available'
    };

    this.farmService.addProduct(payload).subscribe({
      next: (res: any) => {
        this.products.unshift(res);
        this.product = { title: '', category: '', quantity: 0, price: 0, description: '' };
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

    const updatedPayload = {
      title: this.editingProduct.title,
      description: this.editingProduct.description,
      price: Number(this.editingProduct.price),
      quantity: Number(this.editingProduct.quantity),
      category: this.editingProduct.category,
      status: this.editingProduct.status || 'Available'
    };

    this.farmService.updateProduct(this.editingProduct._id, updatedPayload).subscribe({
      next: updated => {
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index > -1) {
          this.products[index] = updated;
        }
        this.editingProduct = null;
      },
      error: err => console.error('Error updating product:', err)
    });
  }

  // Returns category name by its id for display in product list
  getCategoryName(categoryId: string): string {
    const cat = this.categories.find(c => c._id === categoryId);
    return cat ? cat.name : 'Unknown';
  }
}
