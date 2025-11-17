import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../core/services/forum.service';
import { ForumPost, ForumCategory, ForumCategoryLabels } from '../../core/models/forum-post.model';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss'
})
export class ForumComponent implements OnInit {
  categories = Object.values(ForumCategory);
  categoryLabels = ForumCategoryLabels;
  activeCategory: ForumCategory = ForumCategory.TipsAndTricks;
  
  posts: Map<ForumCategory, ForumPost[]> = new Map();
  loading: Map<ForumCategory, boolean> = new Map();
  
  showAddForm: Map<ForumCategory, boolean> = new Map();
  newPostForms: Map<ForumCategory, { title: string; content: string }> = new Map();
  submitting: Map<ForumCategory, boolean> = new Map();
  messages: Map<ForumCategory, string> = new Map();

  constructor(private forumService: ForumService) {
    // Initialize maps
    this.categories.forEach(category => {
      this.posts.set(category, []);
      this.loading.set(category, false);
      this.showAddForm.set(category, false);
      this.newPostForms.set(category, { title: '', content: '' });
      this.submitting.set(category, false);
      this.messages.set(category, '');
    });
  }

  ngOnInit() {
    this.loadPostsForAllCategories();
  }

  loadPostsForAllCategories() {
    this.categories.forEach(category => {
      this.loadPosts(category);
    });
  }

  loadPosts(category: ForumCategory) {
    this.loading.set(category, true);
    this.forumService.getPosts(category).subscribe({
      next: (posts) => {
        this.posts.set(category, posts);
        this.loading.set(category, false);
      },
      error: () => {
        this.loading.set(category, false);
        this.messages.set(category, 'Error loading posts.');
      }
    });
  }

  setActiveCategory(category: ForumCategory) {
    this.activeCategory = category;
    if (this.posts.get(category)?.length === 0) {
      this.loadPosts(category);
    }
  }

  toggleAddForm(category: ForumCategory) {
    const current = this.showAddForm.get(category) || false;
    this.showAddForm.set(category, !current);
    if (!current) {
      this.messages.set(category, '');
    }
  }

  onSubmitPost(category: ForumCategory) {
    const form = this.newPostForms.get(category);
    if (!form || !form.title.trim()) {
      this.messages.set(category, 'Post title is required.');
      return;
    }

    this.submitting.set(category, true);
    this.messages.set(category, '');

    this.forumService.createPost({
      title: form.title.trim(),
      content: form.content.trim() || undefined,
      category: category
    }).subscribe({
      next: (post) => {
        const currentPosts = this.posts.get(category) || [];
        this.posts.set(category, [post, ...currentPosts]);
        this.newPostForms.set(category, { title: '', content: '' });
        this.showAddForm.set(category, false);
        this.messages.set(category, 'Post created successfully!');
        this.submitting.set(category, false);
      },
      error: (error) => {
        this.messages.set(category, error.error?.message || 'Error creating post. Please try again.');
        this.submitting.set(category, false);
      }
    });
  }

  getPostsForCategory(category: ForumCategory): ForumPost[] {
    return this.posts.get(category) || [];
  }

  isLoading(category: ForumCategory): boolean {
    return this.loading.get(category) || false;
  }

  isAddFormVisible(category: ForumCategory): boolean {
    return this.showAddForm.get(category) || false;
  }

  isSubmitting(category: ForumCategory): boolean {
    return this.submitting.get(category) || false;
  }

  getMessage(category: ForumCategory): string {
    return this.messages.get(category) || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

