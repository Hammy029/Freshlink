import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Category {
  _id?: string;
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
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(cats => cats.map(cat => ({
        _id: cat._id?.toString() || cat._id,
        name: cat.name,
        description: cat.description
      })))
    );
  }

  deleteCategory(id: string): Observable<Category> {
    return this.http.delete<Category>(`${this.apiUrl}/${id}`);
  }

  updateCategory(id: string, category: Category): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, category);
  }
}