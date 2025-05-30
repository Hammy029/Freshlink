import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id?: string;         // Optional MongoDB id
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsercategoryService {
  private apiUrl = 'http://localhost:3000/category';

  constructor(private http: HttpClient) {}

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  deleteCategory(id: string): Observable<Category> {
    return this.http.delete<Category>(`${this.apiUrl}/${id}`);
  }

  updateCategory(id: string, category: Category): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, category);
  }
}
