import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { NgModule } from '@angular/core';
//import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  // ...
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // important for multiple interceptors
    },
    // other providers here...
  ],
})
export class AppModule {}
