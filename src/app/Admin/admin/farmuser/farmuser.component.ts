import { Component, OnInit } from '@angular/core';
import { Category, UsercategoryService } from '../../../services/usercategory.service';
//import { FarmService } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FarmeruserService } from '../../../services/farmeruser.service';

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
  selector: 'app-farmuser',
  templateUrl: './farmuser.component.html',
  styleUrls: ['./farmuser.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class FarmuserComponent implements OnInit {
addProduct() {
throw new Error('Method not implemented.');
}
toggleStatus(_t83: any) {
throw new Error('Method not implemented.');
}
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

  constructor(
    private categoryService: UsercategoryService,
    private farmeruserService: FarmeruserService
  ) {}

  ngOnInit(): void {
    this.loadCategoriesAndProducts();
  }

  private loadCategoriesAndProducts(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.fetchUserProducts();
      },
      error: err => console.error('Error loading categories:', err)
    });
  }

  private fetchUserProducts(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage.');
      return;
    }

    this.farmeruserService.getProductsByUser(userId).subscribe({
      next: (data: any[]) => {
        this.products = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'
        }));
      },
      error: (err: any) => console.error('Error fetching user products:', err)
    });
  }

  postProduct(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage.');
      return;
    }

    const payload: ProductPayload = {
      ...this.product,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity),
      farm: userId,
      status: 'Available'
    };

    this.farmeruserService.addProduct(payload).subscribe({
      next: (res: any) => {
        this.products.unshift(res);
        this.resetForm();
      },
      error: err => console.error('Error posting product:', err)
    });
  }

  resetForm(): void {
    this.product = {
      title: '',
      category: '',
      quantity: 0,
      price: 0,
      description: ''
    };
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

    this.farmeruserService.updateProduct(this.editingProduct._id, updatedPayload).subscribe({
      next: updated => {
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index > -1) {
          this.products[index] = updated;
          this.products = [...this.products]; // trigger UI refresh
        }
        this.editingProduct = null;
      },
      error: err => console.error('Error updating product:', err)
    });
  }

  deleteProduct(id: string): void {
    this.farmeruserService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
      },
      error: err => console.error('Error deleting product:', err)
    });
  }

  markAsSold(id: string): void {
    this.farmeruserService.markAsSold(id).subscribe({
      next: () => {
        const item = this.products.find(p => p._id === id);
        if (item) item.status = 'Sold';
      },
      error: (err: any) => console.error('Error marking as sold:', err)
    });
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories.find(c => c._id === categoryId);
    return cat ? cat.name : 'Unknown';
  }
}
