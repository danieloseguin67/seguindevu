import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Topic } from '../topics/topic.model';

export interface TopicDialogData {
  topic?: Topic;
}

@Component({
  selector: 'app-topic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.topic ? 'Edit Topic' : 'Add Topic' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form" novalidate>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
          @if (form.get('description')?.invalid && form.get('description')?.touched) {
            <mat-error>Description is required</mat-error>
          }
        </mat-form-field>

        <div class="doc-row">
          <mat-form-field appearance="outline" class="doc-url-field">
            <mat-label>Document URL</mat-label>
            <input matInput formControlName="document" placeholder="assets/docs/file.pdf" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="doc-type-field">
            <mat-label>Type</mat-label>
            <mat-select formControlName="documentType">
              <mat-option value="pdf">PDF</mat-option>
              <mat-option value="markdown">Markdown</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="articles-section">
          <div class="articles-header">
            <span class="articles-label">Related Articles</span>
            <button mat-stroked-button type="button" (click)="addArticle()">
              <mat-icon>add</mat-icon> Add Article
            </button>
          </div>

          <div formArrayName="articles">
            @for (article of articlesArray.controls; track $index) {
              <div [formGroupName]="$index" class="article-row">
                <mat-form-field appearance="outline" class="article-title-field">
                  <mat-label>Article Title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="article-url-field">
                  <mat-label>Article URL</mat-label>
                  <input matInput formControlName="url" />
                </mat-form-field>
                <button mat-icon-button color="warn" type="button"
                        (click)="removeArticle($index)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
            @if (articlesArray.length === 0) {
              <p class="no-articles-hint">No articles yet.</p>
            }
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 8px;
        min-width: 480px;
      }
      .full-width { width: 100%; }
      .doc-row { display: flex; gap: 12px; }
      .doc-url-field { flex: 3; }
      .doc-type-field { flex: 1; }
      .articles-section { margin-top: 8px; }
      .articles-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .articles-label { font-weight: 500; font-size: 0.95rem; }
      .article-row { display: flex; gap: 8px; align-items: flex-start; }
      .article-title-field { flex: 1; }
      .article-url-field { flex: 2; }
      .no-articles-hint {
        color: rgba(0, 0, 0, 0.45);
        font-size: 0.875rem;
        font-style: italic;
        margin: 4px 0;
      }
      @media (max-width: 600px) {
        .dialog-form { min-width: unset; }
        .doc-row { flex-direction: column; gap: 0; }
        .article-row { flex-wrap: wrap; }
      }
    `,
  ],
})
export class TopicDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TopicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TopicDialogData
  ) {
    const t = data.topic;
    this.form = this.fb.group({
      title: [t?.title ?? '', Validators.required],
      description: [t?.description ?? '', Validators.required],
      document: [t?.document ?? ''],
      documentType: [t?.documentType ?? 'pdf'],
      articles: this.fb.array(
        (t?.articles ?? []).map((a) =>
          this.fb.group({ title: [a.title], url: [a.url] })
        )
      ),
    });
  }

  get articlesArray(): FormArray {
    return this.form.get('articles') as FormArray;
  }

  addArticle(): void {
    this.articlesArray.push(this.fb.group({ title: [''], url: [''] }));
  }

  removeArticle(index: number): void {
    this.articlesArray.removeAt(index);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
