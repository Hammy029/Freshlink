import { Component, OnInit } from '@angular/core';
import { Category, UsercategoryService } from '../../../services/usercategory.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usercategory',
  templateUrl: './usercategory.component.html',
  styleUrls: ['./usercategory.component.css'],
  imports: [FormsModule, CommonModule]
})
export class UsercategoryComponent implements OnInit {
  category: Category = { name: '', description: '' };
  categories: Category[] = [];
  loading = false;
  error = '';
  
  isEditing = false;
  editingId: string | null = null;

  constructor(private categoryService: UsercategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (err: any) => {
        this.error = 'Failed to load categories';
        console.error(err);
      }
    });
  }

  submitCategory() {
    if (!this.category.name.trim()) return;

    this.loading = true;

    if (this.isEditing && this.editingId) {
      // Update category
      this.categoryService.updateCategory(this.editingId, this.category).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(cat => cat._id === this.editingId);
          if (index > -1) {
            this.categories[index] = updatedCategory;
          }
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Failed to update category.';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      // Create new category
      this.categoryService.createCategory(this.category).subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Failed to add category.';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  editCategory(cat: Category) {
    this.isEditing = true;
    this.editingId = cat._id || null;
    this.category = { name: cat.name, description: cat.description || '' };
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.category = { name: '', description: '' };
    this.isEditing = false;
    this.editingId = null;
    this.loading = false;
    this.error = '';
  }

  deleteCategory(id?: string) {
    if (!id) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(cat => cat._id !== id);
      },
      error: (err: any) => {
        this.error = 'Failed to delete category.';
        console.error(err);
      }
    });
  }
}
