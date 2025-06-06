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
    description: ''
  };

  products: any[] = [];
  categories: Category[] = [];
  editingProduct: any = null;
  isAdmin: boolean = false; // <-- Track admin role

  constructor(
    private categoryService: UsercategoryService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    // Determine user role (assuming you store it in localStorage)
    const role = localStorage.getItem('role'); 
    this.isAdmin = role === 'Admin'; // Adjust if you use different casing/role string

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
    // Use role-based product fetching
    const productsObservable = this.isAdmin
      ? this.farmService.getAllProductsAdmin() // Admin: get all products
      : this.farmService.getMyProducts();       // User: get own products

    productsObservable.subscribe({
      next: (data: any[]) => {
        console.log('Fetched products:', data);

        this.products = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'
        }));
      },
      error: err => console.error('Error fetching products:', err)
    });
  }

  postProduct(): void {
    const farmerId = localStorage.getItem('userId');
    if (!farmerId) {
      console.error('Farmer ID not found in localStorage.');
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
      },
      error: err => console.error('Error posting product:', err)
    });
  }

  private resetForm(): void {
    this.product = {
      title: '',
      category: '',
      quantity: 0,
      price: 0,
      description: ''
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
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  updateProduct(): void {
    if (!this.editingProduct) return;

    const updatedPayload: ProductPayload = {
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
          this.products = [...this.products]; // Force UI refresh
        }
        this.editingProduct = null;
      },
      error: err => console.error('Error updating product:', err)
    });
  }

  getCategoryName(category: any): string {
    if (typeof category === 'object' && category.name) return category.name;

    const found = this.categories.find(c => c._id === category);
    return found ? found.name : 'Unknown';
  }
}
