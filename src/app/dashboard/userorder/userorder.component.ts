import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../search/search.component';
import { FarmService, Order } from '../../services/farm.service';

@Component({
  selector: 'app-userorder',
  standalone: true,
  templateUrl: './userorder.component.html',
  imports: [CommonModule, FormsModule, SearchComponent],
  styleUrls: ['./userorder.component.css'],
})
export class UserorderComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  copyToastVisible = false;
  isAdmin = false;
  currentUserId: string | null = null;

  constructor(private router: Router, private farmService: FarmService) {}

  ngOnInit(): void {
    this.currentUserId = this.farmService.getCurrentUserId();
    const userRole = localStorage.getItem('role');
    if (userRole === 'admin') {
      this.isAdmin = true;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    if (this.isAdmin) {
      this.loadAllOrders();
    } else {
      this.loadFarmOwnerOrders();
    }
  }

  private loadAllOrders(): void {
    this.farmService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data.map((order) => ({
          ...order,
          total: this.calculateOrderTotal(order),
        }));
        this.loading = false;
        console.log('Admin orders:', this.orders);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.loading = false;
      },
    });
  }

  /**
   * ✅ NEW: Load orders that contain products from the current user's farm
   */
  private loadFarmOwnerOrders(): void {
    this.farmService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        // Filter orders that contain products from current user's farm
        this.orders = data
          .filter((order) => this.containsProductsFromMyFarm(order))
          .map((order) => ({
            ...order,
            total: this.calculateOrderTotal(order),
          }));
        this.loading = false;
        console.log('Farm owner orders:', this.orders);
      },
      error: (err) => {
        console.error('Failed to load farm owner orders:', err);
        this.loading = false;
      },
    });
  }

  /**
   * ✅ NEW: Check if order contains products from current user's farm
   */
  private containsProductsFromMyFarm(order: Order): boolean {
    if (!this.currentUserId || !order.items) return false;

    return order.items.some(
      (item: { product: { farm: { _id: any; id: any } } }) => {
        const farmId = item?.product?.farm?._id || item?.product?.farm?.id;
        return farmId === this.currentUserId;
      }
    );
  }

  /**
   * ✅ UPDATED: Farm owners can only modify orders containing their products
   */
  cancelOrder(orderId: string): void {
    if (!this.canModifyOrder(orderId)) {
      alert('Unauthorized: You cannot cancel this order');
      return;
    }

    if (confirm('Are you sure you want to cancel this order?')) {
      this.farmService.cancelOrder(orderId).subscribe({
        next: () => {
          this.toast('✅ Order canceled successfully!');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Failed to cancel order:', err);
          const msg = err.error?.message || 'Unknown error';
          this.toast(`Cancel failed: ${msg}`);
        },
      });
    }
  }

  removeItemFromOrder(orderId: string, productId: string): void {
    if (!this.canModifyItemFromOrder(orderId, productId)) {
      this.toast('Unauthorized: You cannot modify this item');
      return;
    }

    if (confirm('Remove this product from the order?')) {
      this.farmService.removeProductFromOrder(orderId, productId).subscribe({
        next: () => {
          this.toast('Product removed from order.');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Failed to remove product from order:', err);
          const msg = err.error?.message || 'Unknown error occurred';
          this.toast(`Remove failed: ${msg}`);
        },
      });
    }
  }

  /**
   * ✅ UPDATED: Check if user can modify the order
   */
  canModifyOrder(orderId: string): boolean {
    if (this.isAdmin) return true;

    const order = this.orders.find(
      (o) => o._id === orderId || o.id === orderId
    );
    if (!order || !this.currentUserId) return false;

    // Farm owners can modify orders containing their products
    return this.containsProductsFromMyFarm(order);
  }

  /**
   * ✅ NEW: Check if user can modify a specific item in the order
   */
  private canModifyItemFromOrder(orderId: string, productId: string): boolean {
    if (this.isAdmin) return true;

    const order = this.orders.find(
      (o) => o._id === orderId || o.id === orderId
    );
    if (!order || !this.currentUserId) return false;

    // Find the specific item
    const item = order.items?.find(
      (item: { product: { _id: string } }) => item.product._id === productId
    );
    if (!item) return false;

    // Check if this specific product belongs to current user's farm
    const farmId = item.product?.farm?._id || item.product?.farm?.id;
    return farmId === this.currentUserId;
  }

  /**
   * ✅ NEW: Check if current user owns the farm for a specific product
   */
  canModifyProduct(item: any): boolean {
    if (this.isAdmin) return true;
    if (!this.currentUserId) return false;

    const farmId = item?.product?.farm?._id || item?.product?.farm?.id;
    return farmId === this.currentUserId;
  }

  isOrderOwner(order: Order): boolean {
    return this.isOwnedByCurrentUser(order);
  }

  private isOwnedByCurrentUser(order: Order): boolean {
    if (!this.currentUserId) return false;

    return (
      (typeof order.userId === 'object' && '_id' in order.userId
        ? (order.userId as { _id: string })._id
        : order.userId) === this.currentUserId ||
      order.customerId === this.currentUserId ||
      order.buyerId === this.currentUserId
    );
  }

  /**
   * ✅ Displays customer info for admin view
   */
  getOrderOwnerInfo(order: Order): string {
    if (!this.isAdmin) return '';
    const owner = order.userId || order.customerId || order.buyerId;
    return owner ? `Owner: ${owner}` : 'Owner: Unknown';
  }

  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showCopyToast();
      })
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
      });
  }

  showCopyToast(): void {
    this.copyToastVisible = true;
    setTimeout(() => {
      this.copyToastVisible = false;
    }, 2000);
  }

  toast(message: string): void {
    this.copyToastVisible = true;
    console.log(message);
    setTimeout(() => {
      this.copyToastVisible = false;
    }, 2000);
  }

  refreshOrders(): void {
    this.loadOrders();
  }

  /**
   * ✅ Calculates total for each order based on product price * quantity
   */
  private calculateOrderTotal(order: Order): number {
    return (
      order.items?.reduce(
        (sum: number, item: { product: { price: any }; quantity: any }) =>
          sum + (item?.product?.price || 0) * (item?.quantity || 0),
        0
      ) || 0
    );
  }

  /**
   * ✅ Computes the grand total across all orders
   */
  get grandTotal(): number {
    return this.orders?.reduce((acc, order) => acc + (order.total || 0), 0);
  }
}
