import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserorderService } from '../../services/userorder.service';

@Component({
  selector: 'app-userorder',
  templateUrl: './userorder.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./userorder.component.css']
})
export class UserorderComponent implements OnInit {
  product: any = null;
  order: any = { quantity: 1, notes: '' };
  orders: any[] = [];
  editingOrderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userorderService: UserorderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load product from sessionStorage if available
    const storedProduct = sessionStorage.getItem('selectedProduct');
    if (storedProduct) {
      this.product = JSON.parse(storedProduct);
      this.order.productId = this.product._id;
    }

    // Fallback: load product from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['productId']) {
        this.product = {
          _id: params['productId'],
          name: params['title'],
          price: params['price'],
          quantity: params['quantity'],
          category: params['category']
        };
        this.order.productId = this.product._id;
        // Save to sessionStorage for later use
        sessionStorage.setItem('selectedProduct', JSON.stringify(this.product));
      }
    });

    this.loadUserOrders();
  }

  loadUserOrders(): void {
    this.userorderService.getUserOrders().subscribe({
      next: (data: any[]) => (this.orders = data),
      error: (err: any) => console.error('Failed to load orders', err)
    });
  }

  submitOrder(): void {
    if (!this.product) return alert('No product selected.');

    if (this.order.quantity > this.product.quantity) {
      return alert('Quantity exceeds available stock!');
    }

    const orderData = {
      productId: this.product._id,
      quantity: this.order.quantity,
      notes: this.order.notes
    };

    if (this.editingOrderId) {
      this.userorderService.updateOrder(this.editingOrderId, orderData).subscribe({
        next: () => {
          alert('Order updated successfully!');
          this.resetForm();
          this.loadUserOrders();
        },
        error: (err: any) => {
          console.error('Failed to update order', err);
          alert('Failed to update order.');
        }
      });
    } else {
      this.userorderService.placeOrder(orderData).subscribe({
        next: () => {
          alert('Order placed successfully!');
          this.resetForm();
          this.loadUserOrders();
        },
        error: (err: any) => {
          console.error('Order failed', err);
          alert('Failed to place order.');
        }
      });
    }
  }

  editOrder(order: any): void {
    this.editingOrderId = order._id;
    this.order.quantity = order.quantity;
    this.order.notes = order.notes;

    // Populate product locally without reload
    this.product = {
      _id: order.productId,
      name: order.productName ?? 'Product',
      price: order.price ?? 0,
      quantity: order.quantity,
      category: order.category ?? ''
    };

    this.order.productId = this.product._id;
    sessionStorage.setItem('selectedProduct', JSON.stringify(this.product));
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.userorderService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order canceled successfully!');
          this.loadUserOrders();
          if (this.editingOrderId === orderId) {
            this.resetForm();
          }
        },
        error: (err: any) => {
          console.error('Failed to cancel order', err);
          alert('Failed to cancel order.');
        }
      });
    }
  }

  resetForm(): void {
    this.editingOrderId = null;
    this.product = null;
    this.order = { quantity: 1, notes: '' };
    sessionStorage.removeItem('selectedProduct');
    this.router.navigate(['/dashboard/userorder']);
  }
}
