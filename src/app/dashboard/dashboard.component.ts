import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { TopicsService } from '../topics/topics.service';
import { Topic } from '../topics/topic.model';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CategoryGroup {
  category: string;
  topics: Topic[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  username = signal<string | null>(null);
  fullname = signal<string | null>(null);
  isAdmin = signal(false);
  topics = signal<Topic[]>([]);
  loading = signal(true);
  panelMode = signal<'list' | 'form'>('list');
  editingTopic = signal<Topic | null>(null);

  categorizedTopics = computed<CategoryGroup[]>(() => {
    const map = new Map<string, Topic[]>();
    for (const topic of this.topics()) {
      const cat = topic.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(topic);
    }
    return Array.from(map.entries()).map(([category, topics]) => ({ category, topics }));
  });
  topicForm!: FormGroup;

  @ViewChild('topicsPanel') topicsPanel!: MatSidenav;

  constructor(
    private auth: AuthService,
    private topicsService: TopicsService,
    private router: Router,
    public translate: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.topicForm = this.buildForm();
    this.username.set(this.auth.getUsername());
    this.fullname.set(this.auth.getFullname());
    this.isAdmin.set(this.auth.isAdmin());
    this.topicsService.loadTopics().subscribe({
      next: (data) => {
        this.topics.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load topics:', err);
        this.loading.set(false);
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }

  switchLang(): void {
    const next = this.translate.currentLang === 'en' ? 'fr' : 'en';
    this.translate.use(next);
  }

  openDocument(topic: Topic): void {
    window.open(topic.document, '_blank', 'noopener,noreferrer');
  }

  openPanel(): void {
    this.panelMode.set('list');
    this.editingTopic.set(null);
    this.topicsPanel.open();
  }

  closePanel(): void {
    this.topicsPanel.close();
  }

  resetTopics(): void {
    this.topicsService.resetToDefaults();
    this.loading.set(true);
    this.topicsService.loadTopics().subscribe({
      next: (data) => {
        this.topics.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingTopic.set(null);
    this.topicForm = this.buildForm();
    this.panelMode.set('form');
  }

  openEditForm(topic: Topic): void {
    this.editingTopic.set(topic);
    this.topicForm = this.buildForm(topic);
    this.panelMode.set('form');
  }

  deleteTopic(topic: Topic): void {
    if (!confirm(`Delete "${topic.title}"?\nThis cannot be undone.`)) return;
    this.topics.set(this.topicsService.deleteTopic(this.topics(), topic.id));
  }

  get articlesArray(): FormArray {
    return this.topicForm.get('articles') as FormArray;
  }

  addArticle(): void {
    this.articlesArray.push(
      this.fb.group({ title: ['', Validators.required], url: ['', Validators.required] })
    );
  }

  removeArticle(i: number): void {
    this.articlesArray.removeAt(i);
  }

  saveForm(): void {
    if (this.topicForm.invalid) {
      this.topicForm.markAllAsTouched();
      return;
    }
    const val = this.topicForm.getRawValue() as Omit<Topic, 'id'>;
    const editing = this.editingTopic();
    if (editing) {
      this.topics.set(this.topicsService.updateTopic(this.topics(), { ...val, id: editing.id }));
    } else {
      this.topics.set(this.topicsService.addTopic(this.topics(), val));
    }
    this.panelMode.set('list');
    this.editingTopic.set(null);
  }

  backToList(): void {
    this.panelMode.set('list');
    this.editingTopic.set(null);
  }

  private buildForm(topic?: Topic): FormGroup {
    return this.fb.group({
      category: [topic?.category ?? ''],
      title: [topic?.title ?? '', Validators.required],
      description: [topic?.description ?? '', Validators.required],
      document: [topic?.document ?? ''],
      documentType: [topic?.documentType ?? 'pdf'],
      articles: this.fb.array(
        (topic?.articles ?? []).map((a) =>
          this.fb.group({
            title: [a.title, Validators.required],
            url: [a.url, Validators.required],
          })
        )
      ),
    });
  }
}
