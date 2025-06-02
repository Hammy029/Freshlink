import { Component, OnInit } from '@angular/core';
//import { FarmService } from '../services/farm.service';  // Adjust path as needed
import { FormsModule } from '@angular/forms';
import { FarmService } from '../../services/farm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-farmer',
  templateUrl: './farmer.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./farmer.component.css']  // Fixed typo here from styleUrl to styleUrls
})
export class FarmerComponent implements OnInit {
  products: any[] = [];
  errorMessage = '';

  constructor(private farmService: FarmService) {}

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

  // Example stub for placing order, integrate your order service here later
  placeOrder(productId: string, quantity: number) {
    console.log(`Order placed for product ${productId} with quantity ${quantity}`);
    // TODO: Call OrderService to actually create order
  }
}
