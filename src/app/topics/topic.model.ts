export interface Article {
  title: string;
  titleFr?: string;
  url: string;
}

export interface Topic {
  id: number;
  category: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  document: string;
  documentType: 'pdf' | 'markdown';
  price: number;
  available: boolean;
  subscriptionRequired: boolean;
  supportplanavailable: boolean;
  articles: Article[];
}
