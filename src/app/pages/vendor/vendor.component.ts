import { Component } from '@angular/core';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent {
  produceList = [
    { name: 'Sukuma Wiki', price: 30, quantity: 40, farmer: 'John' },
    { name: 'Tomatoes', price: 45, quantity: 80, farmer: 'Jane' },
    { name: 'Onions', price: 38, quantity: 60, farmer: 'Peter' }
  ];
}
