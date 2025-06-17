import { Routes } from "@angular/router";
import { AdminComponent } from "./Admin/admin/admin.component";
import { ForgotPasswordComponent } from "./authentication/forgot-password/forgot-password.component";
import { GoogleCallbackComponent } from "./authentication/google-callback/google-callback.component";
import { LoginComponent } from "./authentication/login/login.component";
import { RegisterComponent } from "./authentication/register/register.component";
import { ResetPasswordComponent } from "./authentication/reset-password/reset-password.component";
import { UpdatePasswordComponent } from "./authentication/update-password/update-password.component";
import { AuthGuard } from "./core/auth/auth.guard";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsercategoryComponent } from "./Admin/admin/usercategory/usercategory.component";
import { UserfarmerComponent } from "./dashboard/userfarmer/userfarmer.component";
import { UserorderComponent } from "./dashboard/userorder/userorder.component";
import { UservendorComponent } from "./dashboard/uservendor/uservendor.component";
import { AboutComponent } from "./pages/about/about.component";
import { BlogsComponent } from "./pages/blogs/blogs.component";
import { ChatComponent } from "./pages/chat/chat.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { ErrorComponent } from "./pages/error/error.component";
import { FarmerComponent } from "./pages/farmer/farmer.component";
import { HomeComponent } from "./pages/home/home.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { PaymentComponent } from "./pages/payment/payment.component";
import { ProduceComponent } from "./pages/produce/produce.component";
import { ServicesComponent } from "./pages/services/services.component";
import { VendorComponent } from "./pages/vendor/vendor.component";
import { FarmuserComponent } from "./users/farmuser/farmuser.component";
import { UsersComponent } from "./users/users.component";

export const routes: Routes = [
  // Public Pages
  { path: '', title: 'Home', component: HomeComponent },
  { path: 'about', title: 'About', component: AboutComponent },
  { path: 'contact', title: 'Contact', component: ContactComponent },
  { path: 'services', title: 'Services', component: ServicesComponent },
  { path: 'blogs', title: 'Blogs', component: BlogsComponent },

  // Farmer/Vendor Info
  { path: 'farmer', title: 'Farmer', component: FarmerComponent },
  { path: 'vendor', title: 'Vendor', component: VendorComponent },
  { path: 'produce', title: 'Produce', component: ProduceComponent },

  // Order & Payment
  { path: 'payment', title: 'Payment', component: PaymentComponent },
  { path: 'orders', title: 'Orders', component: OrdersComponent },
  { path: 'chat', title: 'Chat', component: ChatComponent },

  // Auth Pages
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'google-callback', canActivate: [AuthGuard], title: 'Google', component: GoogleCallbackComponent },
  { path: 'forgot-password', title: 'Forget password', component: ForgotPasswordComponent },
  { path: 'update-password', title: 'Update password', component: UpdatePasswordComponent },
  { path: 'reset-password', title: 'Reset password', component: ResetPasswordComponent },

  // Dashboard - General (User + Admin)
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', component: DashboardComponent },
      {
        path: 'userfarmer',
        component: UserfarmerComponent,
        title: 'User Farmer',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
      },
      {
        path: 'userorder',
        component: UserorderComponent,
        title: 'User Orders',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
      },
      {
        path: 'userorder/:id',
        component: UserorderComponent,
        title: 'User Order Details',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
      }
    ]
  },

  // Admin Panel Routes
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'usercategory',
        component: UsercategoryComponent,
        title: 'Category',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'uservendor',
        component: UservendorComponent,
        title: 'User Vendor',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] }
      }
    ]
  },

  // Users
  {
    path: 'users',
    title: 'Users',
    component: UsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'admin'] },
    children: [
      {
        path: 'farmuser',
        component: FarmuserComponent,
        title: 'Farm User',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
      }
    ]
  },

  // Error fallback
  { path: '**', title: '400', component: ErrorComponent }
];
