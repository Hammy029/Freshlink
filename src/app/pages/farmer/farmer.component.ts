import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../../services/farm.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../cart/service/cart.service';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./farmer.component.css']
})
export class FarmerComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';
  Math: any;

  itemsPerPage: number = 9;
  currentPage: number = 1;

  constructor(
    private farmService: FarmService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.farmService.getAvailableProductsPublic().subscribe({
      next: (data) => {
        this.products = data.map(product => ({
          ...product,
          _originalQuantity: product.quantity,
          quantity: product.quantity,
          orderQuantity: 1,
          imageUrl: product.imageUrl || '' // ✅ Include imageUrl for use in UI
        }));
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        console.error(err);
      }
    });
  }

  paginatedProducts(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  redirectToOrderForm(productId: string) {
    this.router.navigate(['dashboard/userorder', productId]);
  }

  increaseQuantity(product: any) {
    if (product.orderQuantity < product._originalQuantity) {
      product.orderQuantity++;
      this.updateAvailableQuantity(product);
    }
  }

  decreaseQuantity(product: any) {
    if (product.orderQuantity > 1) {
      product.orderQuantity--;
      this.updateAvailableQuantity(product);
    }
  }

  updateAvailableQuantity(product: any) {
    product.quantity = product._originalQuantity - product.orderQuantity;
  }

  addToCart(product: any) {
    const quantity = product.orderQuantity || 1;

    if (quantity < 1 || quantity > product._originalQuantity) return;

    const cartItem = {
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity,
      availableQuantity: product._originalQuantity,
      imageUrl: product.imageUrl || '' // ✅ Pass image to cart if needed
    };

    this.cartService.addToCart(cartItem);

    this.farmService.reduceProductQuantity(product._id, quantity).subscribe({
      next: (updatedProduct) => {
        product._originalQuantity = updatedProduct.quantity;
        product.quantity = updatedProduct.quantity;
        product.orderQuantity = 1;

        alert(`${product.title} added to cart successfully!`);
      },
      error: (err) => {
        console.error('Failed to reduce product quantity:', err);
        alert('Error: Could not update product quantity on server.');
      }
    });
  }

  getTotalPrice(product: any): number {
    return (product.orderQuantity || 0) * product.price;
  }
}
