import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private baseUrl = 'http://localhost:3000/farm';

  constructor(private http: HttpClient) {}

  // Get all products
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Add new product
  addProduct(product: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, product);
  }

  // Update product
  updateProduct(id: string, updatedData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, updatedData);
  }

  // Delete product
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // Mark product as sold
  markAsSold(id: string): Observable<any> {
    return this.updateProduct(id, { status: 'Sold' });
  }
}
