import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  accessKey = '42c5178e-d0e6-4317-8f51-5b24aca13f8e'; // Replace with Web3Forms key

  formData = {
    name: '',
    email: '',
    message: ''
  };

  loading = false;
  success = false;
  error = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.loading = true;
    this.success = false;
    this.error = false;

    const payload = new FormData();
    payload.append('access_key', this.accessKey);
    payload.append('name', this.formData.name);
    payload.append('email', this.formData.email);
    payload.append('message', this.formData.message);

    this.http.post('https://api.web3forms.com/submit', payload).subscribe({
      next: () => {
        this.success = true;
        this.formData = { name: '', email: '', message: '' };
      },
      error: () => {
        this.error = true;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
