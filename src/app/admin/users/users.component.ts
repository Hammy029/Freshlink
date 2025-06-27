import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { User, UserService } from './service/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;

  // For editing
  editingUser: User | null = null;
  editedUser: Partial<User> = {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
        this.error = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  // ✅ Delete a user by ID
  deleteUser(id: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user._id !== id);
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.error = 'Failed to delete user.';
      }
    });
  }

  // ✅ Prepare to edit a user
  editUser(user: User): void {
    this.editingUser = { ...user }; // reference for ID & comparison
    this.editedUser = {
      username: user.username,
      phone_no: user.phone_no,
      role: user.role
    };
  }

  // ✅ Submit edited user
  saveChanges(): void {
    if (!this.editingUser || !this.editingUser._id) return;

    const updatedData: Partial<User> = {
      username: this.editedUser.username,
      phone_no: this.editedUser.phone_no,
      role: this.editedUser.role
    };

    this.userService.updateUser(this.editingUser._id, updatedData).subscribe({
      next: () => {
        // Re-fetch list to ensure synced UI with DB
        this.fetchUsers();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to update user:', err);
        this.error = 'Failed to update user.';
      }
    });
  }

  // ✅ Cancel editing
  cancelEdit(): void {
    this.editingUser = null;
    this.editedUser = {};
  }
}
