import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FarmerComponent } from './pages/farmer/farmer.component';
import { VendorComponent } from './pages/vendor/vendor.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ProduceComponent } from './pages/produce/produce.component';
import { ErrorComponent } from './pages/error/error.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { ServicesComponent } from './pages/services/services.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { GoogleCallbackComponent } from './authentication/google-callback/google-callback.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { UpdatePasswordComponent } from './authentication/update-password/update-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/auth/auth.guard';
// import { UserfarmerComponent } from './dashboard/userfarmer/userfarmer.component';
import { UservendorComponent } from './dashboard/uservendor/uservendor.component';
import { UserfarmerComponent } from './dashboard/userfarmer/userfarmer.component';
import { UsercategoryComponent } from './dashboard/usercategory/usercategory.component';


export const routes: Routes = [
  { path: '', title: 'Home', component: HomeComponent },
  { path: 'farmer', title: 'Farmer', component: FarmerComponent },
  { path: 'vendor', title: 'Vendor', component: VendorComponent },
  { path: 'produce', title: 'Produce', component: ProduceComponent },
  { path: 'payment', title: 'Payment', component: PaymentComponent },
  { path: 'orders', title: 'Orders', component: OrdersComponent },
  { path: 'chat', title: 'Chat', component: ChatComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'services', title: 'Services', component: ServicesComponent },
  { path: 'blogs', title: 'Blogs', component: BlogsComponent },
  { path: 'about', title: 'About', component: AboutComponent },
  { path: 'contact', title: 'Contact', component: ContactComponent },
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'google-callback', canActivate: [AuthGuard], title: 'Google', component: GoogleCallbackComponent },
  { path: 'forgot-password', title: 'Forget password', component: ForgotPasswordComponent },
  { path: 'update-password', title: 'Update password', component: UpdatePasswordComponent },
  { path: 'reset-password', title: 'Reset password', component: ResetPasswordComponent },
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'userfarmer',
        component: UserfarmerComponent,
        canActivate: [AuthGuard],
        title: 'User Farmer',
      },
      {
        path: 'uservendor',
        component: UservendorComponent,
        canActivate: [AuthGuard],
        title: 'User Vendor',
      },
      {
        path:'usercategory',
        component:UsercategoryComponent,
        canActivate:[AuthGuard],
        'title':'Category'
      }
    ],
  },
  { path: '**', title: '400', component: ErrorComponent },
];
