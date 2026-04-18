import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { TopicsService } from '../topics/topics.service';
import { Topic } from '../topics/topic.model';
import { TopicDialogComponent } from './topic-dialog.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-topics',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './admin-topics.component.html',
  styleUrl: './admin-topics.component.scss',
})
export class AdminTopicsComponent implements OnInit {
  topics = signal<Topic[]>([]);
  loading = signal(true);
  displayedColumns = ['title', 'description', 'type', 'articles', 'actions'];

  constructor(
    private topicsService: TopicsService,
    private auth: AuthService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.topicsService.loadTopics().subscribe((topics) => {
      this.topics.set(topics);
      this.loading.set(false);
    });
  }

  openAdd(): void {
    const ref = this.dialog.open(TopicDialogComponent, {
      data: {},
      width: '680px',
      maxWidth: '98vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.topics.set(this.topicsService.addTopic(this.topics(), result));
      }
    });
  }

  openEdit(topic: Topic): void {
    const ref = this.dialog.open(TopicDialogComponent, {
      data: { topic },
      width: '680px',
      maxWidth: '98vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.topics.set(this.topicsService.updateTopic(this.topics(), {
          ...result,
          id: topic.id,
        }));
      }
    });
  }

  delete(topic: Topic): void {
    if (!confirm(`Delete topic "${topic.title}"?\nThis cannot be undone.`)) {
      return;
    }
    this.topics.set(this.topicsService.deleteTopic(this.topics(), topic.id));
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.auth.logout();
  }
}
