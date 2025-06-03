import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FarmService } from '../../services/farm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./farmer.component.css']
})
export class FarmerComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';

  constructor(private farmService: FarmService, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.farmService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products';
        console.error(err);
      }
    });
  }

  redirectToOrderForm(productId: string) {
    // Navigate to user order form with productId param
    this.router.navigate(['dashboard/userorder', productId]);
  }
}
