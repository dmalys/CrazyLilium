
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector:'app-contact',
  standalone:true,
  imports:[ReactiveFormsModule, NgIf],
  templateUrl:'./contact.component.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  sent = false;
  error: string | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: [''],
    message: ['', Validators.required]
  });

  submit() {
    this.error = null;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.http.post('/api/contact', this.form.value).subscribe({
      next: () => { this.sent = true; this.form.reset(); },
      error: () => { this.error = 'Failed to send. Please try again later.'; }
    });
  }
}
