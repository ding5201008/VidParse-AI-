export interface VideoAnalysis {
  title: string;
  platform: 'TikTok' | 'YouTube' | 'Instagram' | 'Unknown';
  author: string;
  summary: string;
  tags: string[];
  sentimentScore: number; // 0 to 100
  viewsEstimate?: string;
  uploadDate?: string;
}

export interface HistoryItem extends VideoAnalysis {
  id: string;
  url: string;
  timestamp: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}