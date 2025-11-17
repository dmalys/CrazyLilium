import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  sendContact(request: ContactRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, request);
  }
}


