import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserorderService } from '../../services/userorder.service';

@Component({
  selector: 'app-userorder',
  templateUrl: './userorder.component.html',
  imports:[CommonModule,FormsModule],
  styleUrls: ['./userorder.component.css']
})
export class UserorderComponent implements OnInit {
  product: any = null;
  order: any = { quantity: 1, notes: '' };
  orders: any[] = []; // existing user orders
  editingOrderId: string | null = null; // track if editing
  productService: any;

  constructor(
    private route: ActivatedRoute,
    private userorderService: UserorderService,
    private orderService: UserorderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get product id from route if any
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    }
    this.loadUserOrders();
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (data: any) => (this.product = data),
      error: (err: any) => {
        console.error('Failed to load product', err);
        alert('Product not found');
        this.router.navigate(['/dashboard/userorder']);
      }
    });
  }

  loadUserOrders(): void {
    this.orderService.getUserOrders().subscribe({
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
      // Edit existing order
      this.orderService.updateOrder(this.editingOrderId, orderData).subscribe({
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
      // Place new order
      this.orderService.placeOrder(orderData).subscribe({
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
    this.loadProduct(order.productId);
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
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
    this.router.navigate(['/dashboard/userorder']); // Clear product id param if any
  }
}
