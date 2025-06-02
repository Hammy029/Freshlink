import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProductPayload {
  title: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  status?: 'Available' | 'Sold';
  farm?: string; // user ID
}

@Injectable({
  providedIn: 'root'
})
export class FarmeruserService {
  private apiUrl = 'http://localhost:3000/farm'; // 🔁 Update this to match your backend base URL

  constructor(private http: HttpClient) {}

  // ✅ Get all products by current farmer/user
  getProductsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Add a new product
  addProduct(payload: ProductPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }

  // ✅ Update product
  updateProduct(id: string, payload: ProductPayload): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload);
  }

  // ✅ Delete product
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Mark as sold
  markAsSold(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/status/${id}`, { status: 'Sold' });
  }
}
