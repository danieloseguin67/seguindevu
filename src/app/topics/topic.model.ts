export interface Article {
  title: string;
  url: string;
}

export interface Topic {
  id: number;
  category: string;
  title: string;
  description: string;
  descriptionFr?: string;
  document: string;
  documentType: 'pdf' | 'markdown';
  articles: Article[];
}
