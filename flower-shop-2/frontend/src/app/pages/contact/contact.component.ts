import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmitting = false;
  submitMessage = '';

  constructor(private contactService: ContactService) {}

  onSubmit() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.submitMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';

    this.contactService.sendContact(this.contactForm).subscribe({
      next: () => {
        this.submitMessage = 'Thank you! Your message has been sent successfully.';
        this.contactForm = { name: '', email: '', subject: '', message: '' };
        this.isSubmitting = false;
      },
      error: () => {
        this.submitMessage = 'Sorry, there was an error sending your message. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}


