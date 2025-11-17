import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumPost, ForumCategory } from '../models/forum-post.model';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private apiUrl = '/api/forum';

  constructor(private http: HttpClient) {}

  getPosts(category?: ForumCategory): Observable<ForumPost[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ForumPost[]>(`${this.apiUrl}/posts`, { params });
  }

  createPost(post: { title: string; content?: string; category: ForumCategory }): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/posts`, post);
  }
}

