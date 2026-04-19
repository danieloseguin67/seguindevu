import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Topic } from './topic.model';

@Injectable({ providedIn: 'root' })
export class TopicsService {
  private readonly LS_KEY = 'seguindevu_topics';
  private readonly REQUEST_TIMEOUT_MS = 5000;

  constructor(private http: HttpClient) {}

  private normalizeTopics(raw: unknown): Topic[] | null {
    if (!Array.isArray(raw)) {
      return null;
    }

    const normalized: Topic[] = [];
    for (const item of raw) {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const t = item as Record<string, unknown>;
      const id = typeof t['id'] === 'number' ? t['id'] : Number(t['id']);
      if (!Number.isFinite(id)) {
        return null;
      }

      const title = typeof t['title'] === 'string' ? t['title'] : '';
      const titleFr =
        typeof t['titleFr'] === 'string' ? t['titleFr'] : undefined;
      const category = typeof t['category'] === 'string' && t['category'].trim()
        ? t['category'].trim()
        : 'General';
      const description =
        typeof t['description'] === 'string' ? t['description'] : '';
      const descriptionFr =
        typeof t['descriptionFr'] === 'string' ? t['descriptionFr'] : undefined;
      const document = typeof t['document'] === 'string' ? t['document'] : '';
      const documentType =
        t['documentType'] === 'pdf' || t['documentType'] === 'markdown'
          ? (t['documentType'] as 'pdf' | 'markdown')
          : 'pdf';

      const rawArticles = Array.isArray(t['articles'])
        ? (t['articles'] as unknown[])
        : [];
      const articles = rawArticles
        .filter(
          (a): a is Record<string, unknown> => !!a && typeof a === 'object'
        )
        .map((a) => ({
          title: typeof a['title'] === 'string' ? a['title'] : '',
          ...(typeof a['titleFr'] === 'string' ? { titleFr: a['titleFr'] } : {}),
          url: typeof a['url'] === 'string' ? a['url'] : '',
        }))
        .filter((a) => a.title.length > 0 && a.url.length > 0);

      const rawPrice = t['price'];
      const price = typeof rawPrice === 'number' && rawPrice >= 0 ? rawPrice : 0;
      const available = t['available'] !== false;
      const subscriptionRequired = t['subscriptionRequired'] === true;
      const supportplanavailable = t['supportplanavailable'] === true;

      normalized.push({
        id,
        category,
        title,
        ...(titleFr ? { titleFr } : {}),
        description,
        ...(descriptionFr ? { descriptionFr } : {}),
        document,
        documentType,
        price,
        available,
        subscriptionRequired,
        supportplanavailable,
        articles,
      });
    }

    return normalized;
  }

  loadTopics(): Observable<Topic[]> {
    const stored = localStorage.getItem(this.LS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        const normalized = this.normalizeTopics(parsed);
        if (normalized) {
          return of(normalized);
        }
        localStorage.removeItem(this.LS_KEY);
      } catch {
        localStorage.removeItem(this.LS_KEY);
      }
    }

    return this.http.get<unknown>('topics.json').pipe(
      timeout({ first: this.REQUEST_TIMEOUT_MS }),
      map((raw) => this.normalizeTopics(raw) ?? []),
      catchError(() => of([]))
    );
  }

  saveTopics(topics: Topic[]): void {
    localStorage.setItem(this.LS_KEY, JSON.stringify(topics));
  }

  resetToDefaults(): void {
    localStorage.removeItem(this.LS_KEY);
  }

  addTopic(topics: Topic[], topic: Omit<Topic, 'id'>): Topic[] {
    const maxId = topics.reduce((m, t) => Math.max(m, t.id), 0);
    const result = [...topics, { ...topic, id: maxId + 1 }];
    this.saveTopics(result);
    return result;
  }

  updateTopic(topics: Topic[], updated: Topic): Topic[] {
    const result = topics.map((t) => (t.id === updated.id ? updated : t));
    this.saveTopics(result);
    return result;
  }

  deleteTopic(topics: Topic[], id: number): Topic[] {
    const result = topics.filter((t) => t.id !== id);
    this.saveTopics(result);
    return result;
  }
}
