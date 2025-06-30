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
  imageUrl?: string;
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
    imageUrl: ''
  };

  products: any[] = [];
  categories: Category[] = [];
  editingProduct: any = null;
  showAddForm: boolean = false;
  isAdmin: boolean = false;
  isSubmitting: boolean = false;
  currentUserId: string | null = null; // ✅ Added to track current user

  constructor(
    private categoryService: UsercategoryService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('userId'); // ✅ Get current user ID
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
        let filteredProducts = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'
        }));

        // ✅ Filter products based on user role
        if (!this.isAdmin && this.currentUserId) {
          // Regular users see only their own products
          filteredProducts = filteredProducts.filter(prod => 
            prod.farm._id === this.currentUserId || 
            prod.farmerId === this.currentUserId ||
            prod.userId === this.currentUserId
          );
        }
        // ✅ Admins see all products (no filtering)

        this.products = filteredProducts;
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

    if (!this.currentUserId) {
      console.error('User ID not found in localStorage.');
      this.isSubmitting = false;
      return;
    }

    const payload: ProductPayload = {
      ...this.product,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity),
      farm: this.currentUserId, // ✅ Use currentUserId instead of farmerId
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
    // ✅ Check if user can modify this product
    if (!this.canModifyProduct(id)) {
      console.error('Unauthorized: Cannot modify this product');
      return;
    }

    this.farmService.markAsSold(id).subscribe({
      next: () => {
        const item = this.products.find(p => p._id === id);
        if (item) item.status = 'Sold';
      },
      error: err => console.error('Error marking as sold:', err)
    });
  }

  deleteProduct(id: string): void {
    // ✅ Check if user can modify this product
    if (!this.canModifyProduct(id)) {
      console.error('Unauthorized: Cannot delete this product');
      return;
    }

    this.farmService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
      },
      error: err => console.error('Error deleting product:', err)
    });
  }

  startEdit(prod: any): void {
    // ✅ Check if user can modify this product
    if (!this.canModifyProduct(prod._id)) {
      console.error('Unauthorized: Cannot edit this product');
      return;
    }

    this.editingProduct = { ...prod };
    this.showAddForm = false;
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  updateProduct(): void {
    if (!this.editingProduct || this.isSubmitting) return;
    
    // ✅ Check if user can modify this product
    if (!this.canModifyProduct(this.editingProduct._id)) {
      console.error('Unauthorized: Cannot update this product');
      this.isSubmitting = false;
      return;
    }

    this.isSubmitting = true;

    const updatedPayload: ProductPayload = {
      title: this.editingProduct.title,
      description: this.editingProduct.description,
      price: Number(this.editingProduct.price),
      quantity: Number(this.editingProduct.quantity),
      category: this.editingProduct.category,
      imageUrl: this.editingProduct.imageUrl,
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

  // ✅ Helper method to check if current user can modify a product
  private canModifyProduct(productId: string): boolean {
    if (this.isAdmin) return true; // Admins can modify any product
    
    const product = this.products.find(p => p._id === productId);
    if (!product || !this.currentUserId) return false;
    
    // Regular users can only modify their own products
    return product.farm === this.currentUserId || 
           product.farmerId === this.currentUserId ||
           product.userId === this.currentUserId;
  }

  // ✅ Helper method to check if current user owns a product (for UI display)
  isOwner(product: any): boolean {
    if (!this.currentUserId) return false;
    return product.farm === this.currentUserId || 
           product.farmerId === this.currentUserId ||
           product.userId === this.currentUserId;
  }

  getCategoryName(category: any): string {
    if (typeof category === 'object' && category.name) return category.name;

    const found = this.categories.find(c => c._id === category);
    return found ? found.name : 'Unknown';
  }
}