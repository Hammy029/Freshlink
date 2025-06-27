import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface for User (excluding password)
export interface User {
  _id?: string;
  username: string;
  email: string;
  phone_no: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/auth'; // 🔁 Base path only

  constructor(private http: HttpClient) {}

  // ✅ Fetch all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user`);
  }

  // ✅ Add new user (if needed)
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, user);
  }

  // ✅ Update user by ID
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/user/${id}`, user);
  }

  // ✅ Delete user by ID
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/${id}`);
  }
}
