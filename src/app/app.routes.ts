import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FarmerComponent } from './pages/farmer/farmer.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { ProducelistComponent } from './pages/produce-list/produce-list.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
    {path: '','title':'Home','component': HomeComponent},
    {path: 'farmer',component: FarmerComponent},
    {path: 'vendor',component: VendorComponent},
    {path: 'producelist',component: ProducelistComponent},
    {path: 'payment',component: PaymentComponent},
    {path: 'orders',component: OrdersComponent},
    {path: 'chat',component: ChatComponent}
];
