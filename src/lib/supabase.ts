import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WebsiteAnalysis {
  id: string;
  url: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  overall_score: number;
  structured_data_score: number;
  structured_data_details: Record<string, any>;
  mobile_friendly_score: number;
  mobile_friendly_details: Record<string, any>;
  accessibility_score: number;
  accessibility_details: Record<string, any>;
  content_quality_score: number;
  content_quality_details: Record<string, any>;
  technical_seo_score: number;
  technical_seo_details: Record<string, any>;
  privacy_score: number;
  privacy_details: Record<string, any>;
  recommendations: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    message: string;
  }>;
  created_at: string;
  completed_at: string | null;
}
