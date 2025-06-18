import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interface for Product
export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  category?: {
    name: string;
  };
  farm?: {
    _id: string;
    username: string;
    email: string;
    phone_no: string;
  };
}

// ✅ Interface for Saved Search
export interface SavedSearch {
  _id: string;
  productId: string;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly apiUrl = 'http://localhost:3000/farm'; // Product search
  private readonly savedSearchUrl = 'http://localhost:3000/saved-search'; // Saved search CRUD

  constructor(private http: HttpClient) {}

  // ✅ 1. Search a product by ID (public)
  searchByProductId(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/search/${productId}`);
  }

  // ✅ 2. Save a search result
  saveSearch(productId: string): Observable<SavedSearch> {
    return this.http.post<SavedSearch>(`${this.savedSearchUrl}`, { productId });
  }

  // ✅ 3. Get all saved searches for logged-in user
  getSavedSearches(): Observable<SavedSearch[]> {
    return this.http.get<SavedSearch[]>(`${this.savedSearchUrl}/my`);
  }

  // ✅ 4. Delete a saved search by ID
  deleteSavedSearch(savedSearchId: string): Observable<void> {
    return this.http.delete<void>(`${this.savedSearchUrl}/${savedSearchId}`);
  }

  // ✅ 5. Update saved search with notes/tags
  updateSavedSearch(savedSearchId: string, data: Partial<SavedSearch>): Observable<SavedSearch> {
    return this.http.patch<SavedSearch>(`${this.savedSearchUrl}/${savedSearchId}`, data);
  }
}
