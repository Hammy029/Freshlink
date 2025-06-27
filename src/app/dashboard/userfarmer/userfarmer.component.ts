import { Component, OnInit } from '@angular/core';
import { Category, UsercategoryService } from '../../services/usercategory.service';
import { FarmService } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ProductPayload {
  title: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  imageUrl?: string; // ✅ Added support for image
  status?: 'Available' | 'Sold';
  farm?: string;
}

@Component({
  selector: 'app-farmer',
  templateUrl: './userfarmer.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class UserfarmerComponent implements OnInit {
  product: ProductPayload = {
    title: '',
    category: '',
    quantity: 0,
    price: 0,
    description: '',
    imageUrl: '' // ✅ Initialize
  };

  products: any[] = [];
  categories: Category[] = [];
  editingProduct: any = null;
  showAddForm: boolean = false;
  isAdmin: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private categoryService: UsercategoryService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.farmService.isAdmin();
    this.loadCategoriesAndThenProducts();
  }

  private loadCategoriesAndThenProducts(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.fetchProducts();
      },
      error: err => console.error('Error loading categories:', err)
    });
  }

  private fetchProducts(): void {
    this.farmService.getProducts().subscribe({
      next: (data: any[]) => {
        this.products = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'
        }));
      },
      error: err => console.error('Error fetching products:', err)
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.editingProduct = null;
  }

  postProduct(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const farmerId = localStorage.getItem('userId');
    if (!farmerId) {
      console.error('Farmer ID not found in localStorage.');
      this.isSubmitting = false;
      return;
    }

    const payload: ProductPayload = {
      ...this.product,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity),
      farm: farmerId,
      status: 'Available'
    };

    this.farmService.addProduct(payload).subscribe({
      next: (res: any) => {
        this.products.unshift(res);
        this.resetForm();
        this.showAddForm = false;
        this.isSubmitting = false;

        const formEl = document.querySelector('form');
        if (formEl) (formEl as HTMLFormElement).reset();
      },
      error: err => {
        console.error('Error posting product:', err);
        this.isSubmitting = false;
      }
    });
  }

  private resetForm(): void {
    this.product = {
      title: '',
      category: '',
      quantity: 0,
      price: 0,
      description: '',
      imageUrl: ''
    };
  }

  markAsSold(id: string): void {
    this.farmService.markAsSold(id).subscribe({
      next: () => {
        const item = this.products.find(p => p._id === id);
        if (item) item.status = 'Sold';
      },
      error: err => console.error('Error marking as sold:', err)
    });
  }

  deleteProduct(id: string): void {
    this.farmService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
      },
      error: err => console.error('Error deleting product:', err)
    });
  }

  startEdit(prod: any): void {
    this.editingProduct = { ...prod };
    this.showAddForm = false;
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  updateProduct(): void {
    if (!this.editingProduct || this.isSubmitting) return;
    this.isSubmitting = true;

    const updatedPayload: ProductPayload = {
      title: this.editingProduct.title,
      description: this.editingProduct.description,
      price: Number(this.editingProduct.price),
      quantity: Number(this.editingProduct.quantity),
      category: this.editingProduct.category,
      imageUrl: this.editingProduct.imageUrl, // ✅ Include updated image
      status: this.editingProduct.status || 'Available'
    };

    this.farmService.updateProduct(this.editingProduct._id, updatedPayload).subscribe({
      next: updated => {
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index > -1) {
          this.products[index] = updated;
          this.products = [...this.products];
        }
        this.editingProduct = null;
        this.isSubmitting = false;
      },
      error: err => {
        console.error('Error updating product:', err);
        this.isSubmitting = false;
      }
    });
  }

  getCategoryName(category: any): string {
    if (typeof category === 'object' && category.name) return category.name;

    const found = this.categories.find(c => c._id === category);
    return found ? found.name : 'Unknown';
  }
}
