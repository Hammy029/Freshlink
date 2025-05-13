import { Component } from '@angular/core';

@Component({
  selector: 'app-produce-list',
  templateUrl: './produce-list.component.html',
  styleUrls: ['./produce-list.component.css']
})
export class ProducelistComponent {
  searchQuery: string = '';

  producelist = [
    { name: 'Sukuma Wiki', quantity: 50, price: 30, farmerName: 'John Mwangi' },
    { name: 'Tomatoes', quantity: 100, price: 45, farmerName: 'Jane Wambui' },
    { name: 'Onions', quantity: 75, price: 40, farmerName: 'Peter Otieno' },
    // Add more items or fetch from API
  ];

  filteredProduce() {
    return this.producelist.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  placeOrder(item: any) {
    console.log('Order placed for:', item.name);
    // TODO: Connect to order service or API
  }
}
