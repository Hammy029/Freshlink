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
import { UserorderComponent } from "./dashboard/userorder/userorder.component";

export const routes: Routes = [
  // Public Pages
  { path: '', title: 'Home', component: HomeComponent },
  { path: 'about', title: 'About', component: AboutComponent },
  { path: 'contact', title: 'Contact', component: ContactComponent },
  { path: 'services', title: 'Services', component: ServicesComponent },
  { path: 'blogs', title: 'Blogs', component: BlogsComponent },

  // Farmer/Vendor Info (Assuming public access)
  { path: 'farmer', title: 'Farmer', component: FarmerComponent },
  { path: 'vendor', title: 'Vendor', component: VendorComponent },
  { path: 'produce', title: 'Produce', component: ProduceComponent },

  // Order & Payment (Assuming public or authenticated user access)
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

  // Admin Dashboard (Only accessible by admins)
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'admin'] },  // <-- Restrict dashboard to admins only
    children: [
      {
        path: 'userfarmer',
        component: UserfarmerComponent,
        canActivate: [AuthGuard],
        title: 'User Farmer',
        data: { roles: ['user', 'admin'] }
      },
      {
        path: 'uservendor',
        component: UservendorComponent,
        canActivate: [AuthGuard],
        title: 'User Vendor',
        data: { roles: ['admin'] }
      },
      {
        path: 'usercategory',
        component: UsercategoryComponent,
        canActivate: [AuthGuard],
        title: 'Category',
        data: { roles: ['admin'] }
      }
    ]
  },

  // Farmer User Area (Accessible by 'user' role and 'admin')
  {
    path: 'users',
    title: 'Users',
    component: UsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user', 'admin'] }, // <-- allow user and admin roles
    children: [
      {
        path: 'farmuser',
        component: FarmuserComponent,
        canActivate: [AuthGuard],
        title: 'Farm User',
        data: { roles: ['user', 'admin'] }
      },
      {
  path: 'userorder',
  component: UserorderComponent,
  canActivate: [AuthGuard],
  title: 'User Orders',
  data: { roles: ['user', 'admin'] }
},
{
  path: 'userorder/:id',
  component: UserorderComponent,
  canActivate: [AuthGuard],
  title: 'User Order Details',
  data: { roles: ['user', 'admin'] }
}
    ]
  },

  // Error Page
  { path: '**', title: '400', component: ErrorComponent },
];
