import { Routes } from "@angular/router";
import { ForgotPasswordComponent } from "./authentication/forgot-password/forgot-password.component";
import { GoogleCallbackComponent } from "./authentication/google-callback/google-callback.component";
import { LoginComponent } from "./authentication/login/login.component";
import { RegisterComponent } from "./authentication/register/register.component";
import { ResetPasswordComponent } from "./authentication/reset-password/reset-password.component";
import { UpdatePasswordComponent } from "./authentication/update-password/update-password.component";
import { AuthGuard } from "./core/auth/auth.guard";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { UsercategoryComponent } from "./dashboard/usercategory/usercategory.component";
import { UserfarmerComponent } from "./dashboard/userfarmer/userfarmer.component";
import { UserorderComponent } from "./dashboard/userorder/userorder.component";
import { AboutComponent } from "./pages/about/about.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { ErrorComponent } from "./pages/error/error.component";
import { FarmerComponent } from "./pages/farmer/farmer.component";
import { HomeComponent } from "./pages/home/home.component";
import { OrdersComponent } from "./pages/orders/orders.component";
import { CartComponent } from "./pages/cart/cart.component";
import { SearchComponent } from "./dashboard/search/search.component";
import { AdminComponent } from "./admin/admin/admin.component";
import { UsersComponent } from "./admin/users/users.component";

export const routes: Routes = [
  // Public Pages
  { path: '', title: 'Home', component: HomeComponent },
  { path: 'about', title: 'About', component: AboutComponent },
  { path: 'contact', title: 'Contact', component: ContactComponent },

  // Farmer/Vendor Info
  { path: 'farmer', title: 'Farmer', component: FarmerComponent },
  {path:'cart', title:'Cart', component:CartComponent},

  // Order & Payment
  { path: 'orders', title: 'Orders', component: OrdersComponent },

  // Auth Pages
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'google-callback', title: 'Google', component: GoogleCallbackComponent },
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
      {
        path: 'userfarmer',
        component: UserfarmerComponent,
        title: 'User Farmer',
        canActivate: [AuthGuard],
        data: { roles: ['user', 'admin'] }
      },
      {
        path: 'search',
        component: SearchComponent,
        title: 'Search',
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
  {
    path: 'admin',
    title: 'Admin',
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
        path:'users', 
        title:'Users', 
        component:UsersComponent,
        data: { roles: ['admin']}
      }

    ]

  },
  // Error fallback
  { path: '**', title: '400', component: ErrorComponent }
];
