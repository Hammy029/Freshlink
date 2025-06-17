import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../../services/farm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./farmer.component.css']
})
export class FarmerComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';
  cart: any[] = [];
Math: any;

  constructor(private farmService: FarmService, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.farmService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map(product => ({
          ...product,
          orderQuantity: 1 // Default quantity for cart
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

  addToCart(product: any) {
    const quantity = product.orderQuantity || 1;

    if (quantity < 1 || quantity > product.quantity) return;

    const existing = this.cart.find(item => item._id === product._id);
    if (existing) {
      existing.orderQuantity += quantity;
    } else {
      this.cart.push({
        ...product,
        orderQuantity: quantity
      });
    }

    // Reduce available quantity in UI and reset input
    product.quantity -= quantity;
    product.orderQuantity = 1;
  }

  increaseQuantity(product: any) {
    if (product.orderQuantity < product.quantity) {
      product.orderQuantity++;
    }
  }

  decreaseQuantity(product: any) {
    if (product.orderQuantity > 1) {
      product.orderQuantity--;
    }
  }

  getTotalPrice(product: any): number {
    return (product.orderQuantity || 0) * product.price;
  }
}
