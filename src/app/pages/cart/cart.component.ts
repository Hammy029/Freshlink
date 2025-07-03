import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, CartService } from './service/cart.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MpesaStkModalComponent } from './checkout/mpesa-stk-push/mpesa-stk-push.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MpesaStkModalComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  grandTotal: number = 0;
  deliveryFee: number = 0; // KSh 200 delivery fee
  taxRate: number = 0.16; // 16% tax
  taxAmount: number = 0;
  isBrowser: boolean;

  // Form and UI state
  checkoutForm: FormGroup | any;
  selectedPaymentMethod: 'mpesa' | 'cash' | null = null;
  isProcessing: boolean = false;
  showMpesaModal: boolean = false;

  constructor(
    private cartService: CartService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadCart();
      this.loadUserData();
    }
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^254[0-9]{9}$/)],
      ],
      address: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private loadUserData(): void {
    if (!this.isBrowser) return;

    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        this.checkoutForm.patchValue({
          fullName: userData.name || userData.fullName || '',
          phoneNumber: userData.phone || userData.phoneNumber || '',
          address: userData.address || '',
        });
      }
    } catch (error) {
      console.log('Could not load user data:', error);
    }
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCart();
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.grandTotal = this.cartService.getTotal();
    this.taxAmount = this.grandTotal * this.taxRate;
  }

  getFinalTotal(): number {
    return this.grandTotal + this.deliveryFee + this.taxAmount;
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  increaseQty(item: CartItem): void {
    if (item.quantity < item.availableQuantity) {
      this.cartService.increaseQuantity(item.productId);
      this.loadCart();
    }
  }

  decreaseQty(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.decreaseQuantity(item.productId);
      this.loadCart();
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId);
    this.loadCart();
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.productId;
  }

  generateOrderReference(): string {
    return `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
  }

  proceedToCheckout(): void {
    if (this.checkoutForm.invalid || !this.selectedPaymentMethod) {
      this.markFormGroupTouched();
      return;
    }

    this.isProcessing = true;

    if (this.selectedPaymentMethod === 'mpesa') {
      // Open M-Pesa modal
      this.showMpesaModal = true;
      this.isProcessing = false;
    } else {
      // Process cash order using existing service method
      this.processCashOrder();
    }
  }

  private processCashOrder(): void {
    console.log('📦 Processing cash order...');

    const customerData = this.checkoutForm.value;
    const orderTotals = {
      deliveryFee: this.deliveryFee,
      taxAmount: this.taxAmount,
      finalTotal: this.getFinalTotal(),
    };

    // Use the enhanced cash order method
    this.cartService.sendCashOrder(customerData, orderTotals).subscribe({
      next: (response) => {
        console.log('✅ Cash order placed:', response);
        this.handleOrderSuccess(
          'Cash order placed successfully! We will contact you for delivery.'
        );
      },
      error: (error) => {
        console.error('❌ Cash order failed:', error);
        this.handleOrderError('Failed.Please register and login first.');
      },
    });
  }

  // M-Pesa Modal Event Handlers
  onMpesaPaymentSuccess(paymentData: any): void {
    console.log('✅ M-Pesa payment successful:', paymentData);

    const customerData = this.checkoutForm.value;
    const orderTotals = {
      deliveryFee: this.deliveryFee,
      taxAmount: this.taxAmount,
      finalTotal: this.getFinalTotal(),
    };

    // Use the enhanced M-Pesa order method
    this.cartService
      .sendMpesaOrder(customerData, paymentData, orderTotals)
      .subscribe({
        next: (response) => {
          console.log('✅ M-Pesa order placed:', response);
          this.handleOrderSuccess(
            `Payment successful! Receipt: ${paymentData.MpesaReceiptNumber}`
          );
        },
        error: (error) => {
          console.error('❌ Order creation failed after payment:', error);
          this.handleOrderError(
            'Payment successful but order creation failed. Please contact support with receipt: ' +
              paymentData.MpesaReceiptNumber
          );
        },
      });
  }

  onMpesaPaymentFailed(error: string): void {
    console.error('❌ M-Pesa payment failed:', error);
    this.isProcessing = false;
    alert('Payment failed: ' + error);
  }

  onMpesaModalClosed(): void {
    this.showMpesaModal = false;
    this.isProcessing = false;
  }

  private handleOrderSuccess(message: string): void {
    alert(message);
    this.cartService.clearCart();
    this.loadCart();
    this.resetForm();
    this.isProcessing = false;
    this.showMpesaModal = false;
  }

  private handleOrderError(message: string): void {
    alert(message);
    this.isProcessing = false;
  }

  private resetForm(): void {
    this.selectedPaymentMethod = null;
    this.checkoutForm.reset();
    this.loadUserData();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach((key) => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }
}
