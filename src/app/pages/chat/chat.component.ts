import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule],
  standalone: true
})export class ChatComponent {
  newMessage: string = '';

  messages = [
    { sender: 'farmer', text: 'Hello! Do you have tomatoes?' },
    { sender: 'vendor', text: 'Yes, I have 30kg available!' }
  ];

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        sender: 'vendor', // You can change this based on logged-in user
        text: this.newMessage
      });
      this.newMessage = '';
    }
  }
}
