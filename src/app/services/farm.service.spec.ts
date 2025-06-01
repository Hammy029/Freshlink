import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Farm {
  _id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  farmer: string;
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  getCategories() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/farm'; // adjust accordingly

  constructor(private http: HttpClient) {}

  getFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.apiUrl);
  }

  getFarm(id: string): Observable<Farm> {
    return this.http.get<Farm>(`${this.apiUrl}/${id}`);
  }

  createFarm(farm: Partial<Farm>): Observable<Farm> {
    return this.http.post<Farm>(this.apiUrl, farm);
  }

  updateFarm(id: string, farm: Partial<Farm>): Observable<Farm> {
    return this.http.patch<Farm>(`${this.apiUrl}/${id}`, farm);
  }

  deleteFarm(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
