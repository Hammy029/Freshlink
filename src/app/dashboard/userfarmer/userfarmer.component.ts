import { Component, OnInit } from '@angular/core';
import { FarmService } from '../../services/farm.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ProductPayload {
  title: string;
  category: string | null;
  quantity: number | null;
  price: number | null;
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
    category: null,
    quantity: null,
    price: null,
    description: '',
    imageUrl: ''
  };

  products: any[] = [];
  editingProduct: any = null;
  showAddForm: boolean = false;
  isAdmin: boolean = false;
  isSubmitting: boolean = false;
  currentUserId: string | null = null;

  constructor(private farmService: FarmService) {}

  ngOnInit(): void {
    // ✅ Use the service's own method — reads from localStorage 'user' key
    this.farmService.refreshCurrentUser();
    this.currentUserId = this.farmService.getCurrentUserId();
    this.isAdmin = this.farmService.isAdmin();
    console.log('Current user ID:', this.currentUserId);
    console.log('Is admin:', this.isAdmin);
    this.fetchProducts();
  }

  private getFarmId(farm: any): string {
    return typeof farm === 'object' && farm !== null ? farm._id : farm;
  }

  private fetchProducts(): void {
    this.farmService.getProducts().subscribe({
      next: (data: any[]) => {
        this.products = data.map(prod => ({
          ...prod,
          status: prod.status || 'Available'
        }));
        console.log('Products loaded:', this.products);
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

    // ✅ Refresh user before posting in case session changed
    this.currentUserId = this.farmService.getCurrentUserId();

    if (!this.currentUserId) {
      console.error('User not logged in. Cannot add product.');
      alert('You must be logged in to add a product.');
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      title: this.product.title,
      category: this.product.category,
      price: Number(this.product.price),
      quantity: Number(this.product.quantity),
      description: this.product.description,
      imageUrl: this.product.imageUrl || '',
      status: 'Available'
    };

    console.log('Submitting product payload:', payload);

    this.farmService.addProduct(payload).subscribe({
      next: (res: any) => {
        console.log('Product added successfully:', res);
        this.products.unshift(res);
        this.resetForm();
        this.showAddForm = false;
        this.isSubmitting = false;
      },
      error: err => {
        console.error('Error posting product:', err);
        alert('Failed to add product. Check console for details.');
        this.isSubmitting = false;
      }
    });
  }

  private resetForm(): void {
    this.product = {
      title: '',
      category: null,
      quantity: null,
      price: null,
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

    const updatedPayload: any = {
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

  isOwner(product: any): boolean {
    if (!this.currentUserId) return false;
    const farmId = this.getFarmId(product.farm);
    return (
      farmId === this.currentUserId ||
      product.farmerId === this.currentUserId ||
      product.userId === this.currentUserId
    );
  }
}