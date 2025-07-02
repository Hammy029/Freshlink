import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  description: string;
  clientId: string;
}

// Updated interfaces to match your API response format
export interface STKPushResponse {
  success: boolean;
  message?: string;
  data?: {
    merchantRequestId: string; // camelCase to match API
    checkoutRequestId: string; // camelCase to match API
    responseCode: string; // camelCase to match API
    responseDescription: string; // camelCase to match API
    customerMessage: string; // camelCase to match API
    transactionId: string; // camelCase to match API
    environment: string; // camelCase to match API
  };
}

export interface TransactionStatusResponse {
  success: boolean;
  message?: string;
  data?: {
    resultCode: number | string; // camelCase to match API
    resultDesc: string; // camelCase to match API
    mpesaReceiptNumber?: string; // camelCase to match API
    transactionDate?: string; // camelCase to match API
    amount?: number;
    phoneNumber?: string;
    status?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MpesaService {
  private apiUrl = 'https://urchin-app-ycear.ondigitalocean.app';

  constructor(private http: HttpClient) {}

  /**
   * Initiate STK Push payment
   */
  initiateSTKPush(data: STKPushRequest): Observable<STKPushResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Clean phone number (remove spaces, ensure correct format)
    const cleanedPhoneNumber = this.cleanPhoneNumber(data.phoneNumber);

    const requestData = {
      ...data,
      phoneNumber: cleanedPhoneNumber,
      amount: Math.round(data.amount), // Ensure amount is integer
    };

    console.log('Initiating STK Push:', requestData);

    return this.http
      .post<STKPushResponse>(
        `${this.apiUrl}/mpesa/sandbox/stk-push`,
        requestData,
        {
          headers,
        }
      )
      .pipe(
        timeout(30000), // 30 second timeout
        catchError(this.handleError)
      );
  }

  /**
   * Check transaction status
   */
  checkTransactionStatus(
    checkoutRequestId: string
  ): Observable<TransactionStatusResponse> {
    console.log('Checking transaction status for:', checkoutRequestId);

    return this.http
      .get<TransactionStatusResponse>(
        `${this.apiUrl}/mpesa/transaction/${checkoutRequestId}`
      )
      .pipe(
        timeout(15000), // 15 second timeout
        catchError(this.handleError)
      );
  }

  // In mpesa.service.ts

  /**
   * Clean and format phone number for M-Pesa
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned; // Already in correct format
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1); // Remove leading 0 and add 254
    } else if (cleaned.length === 9) {
      return '254' + cleaned; // Add country code
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    // Valid Kenyan numbers: 254[7|1]XXXXXXXX (12 digits total)
    const kenyanPattern = /^254[71]\d{8}$/;
    return kenyanPattern.test(cleaned);
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumberForDisplay(phoneNumber: string): string {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return `+${cleaned.substring(0, 3)} ${cleaned.substring(
        3,
        6
      )} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
    }
    return phoneNumber;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('M-Pesa Service Error:', error);

    let errorMessage = 'An error occurred';

    if (error.name === 'TimeoutError') {
      errorMessage =
        'Request timed out. Please check your connection and try again.';
    } else if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
