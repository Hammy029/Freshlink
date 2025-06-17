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

  constructor(
    private farmService: FarmService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // ✅ Public fetch method used for general UI access (logged in or not)
  loadProducts() {
    this.farmService.getAvailableProductsPublic().subscribe({
      next: (data) => {
        this.products = data.map(product => ({
          ...product,
          _originalQuantity: product.quantity,
          quantity: product.quantity,
          orderQuantity: 1
        }));
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        console.error(err);
      }
    });
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
      availableQuantity: product._originalQuantity
    };

    this.cartService.addToCart(cartItem);

    // Update product view after adding to cart
    product._originalQuantity -= quantity;
    product.quantity = product._originalQuantity;
    product.orderQuantity = 1;

    alert(`${product.title} added to cart successfully!`);
  }

  getTotalPrice(product: any): number {
    return (product.orderQuantity || 0) * product.price;
  }
}
