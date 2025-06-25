import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (we'll expand this later)
export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          case_id: number;
          case_number: string;
          case_title: string;
          case_type_id: number;
          court_name?: string;
          judge_name?: string;
          jurisdiction?: string;
          filing_date?: string;
          case_status: string;
          case_phase: string;
          total_settlement_amount?: number;
          settlement_approval_date?: string;
          distribution_start_date?: string;
          claim_deadline?: string;
          statute_limitations?: string;
          final_approval_hearing?: string;
          case_closure_date?: string;
          administrative_costs?: number;
          attorney_fees?: number;
          court_costs?: number;
          description?: string;
          notes?: string;
          created_date: string;
          created_by?: number;
          last_modified: string;
          last_modified_by?: number;
        };
        Insert: {
          case_number: string;
          case_title: string;
          case_type_id: number;
          court_name?: string;
          judge_name?: string;
          jurisdiction?: string;
          filing_date?: string;
          case_status?: string;
          case_phase?: string;
          total_settlement_amount?: number;
          settlement_approval_date?: string;
          distribution_start_date?: string;
          claim_deadline?: string;
          statute_limitations?: string;
          final_approval_hearing?: string;
          case_closure_date?: string;
          administrative_costs?: number;
          attorney_fees?: number;
          court_costs?: number;
          description?: string;
          notes?: string;
          created_by?: number;
        };
        Update: {
          case_number?: string;
          case_title?: string;
          case_type_id?: number;
          court_name?: string;
          judge_name?: string;
          jurisdiction?: string;
          filing_date?: string;
          case_status?: string;
          case_phase?: string;
          total_settlement_amount?: number;
          settlement_approval_date?: string;
          distribution_start_date?: string;
          claim_deadline?: string;
          statute_limitations?: string;
          final_approval_hearing?: string;
          case_closure_date?: string;
          administrative_costs?: number;
          attorney_fees?: number;
          court_costs?: number;
          description?: string;
          notes?: string;
          last_modified_by?: number;
        };
      };
      case_types: {
        Row: {
          case_type_id: number;
          case_type_code: string;
          case_type_name: string;
          description?: string;
          regulatory_body?: string;
          typical_duration_months?: number;
          requires_court_approval: boolean;
          active: boolean;
          created_date: string;
        };
        Insert: {
          case_type_code: string;
          case_type_name: string;
          description?: string;
          regulatory_body?: string;
          typical_duration_months?: number;
          requires_court_approval?: boolean;
          active?: boolean;
        };
        Update: {
          case_type_code?: string;
          case_type_name?: string;
          description?: string;
          regulatory_body?: string;
          typical_duration_months?: number;
          requires_court_approval?: boolean;
          active?: boolean;
        };
      };
      // NEW: Data Management Tables
      data_uploads: {
        Row: {
          upload_id: number;
          file_id: string;
          original_filename: string;
          file_size: number;
          file_type: string;
          upload_status:
            | 'uploaded'
            | 'staged'
            | 'mapped'
            | 'ready'
            | 'deployed'
            | 'failed';
          total_rows: number | null;
          uploaded_by: number | null;
          uploaded_at: string;
          processed_at: string | null;
          deployed_at: string | null;
          error_message: string | null;
          metadata: unknown | null;
          created_date: string;
          last_modified: string;
        };
        Insert: {
          file_id: string;
          original_filename: string;
          file_size: number;
          file_type: string;
          upload_status?:
            | 'uploaded'
            | 'staged'
            | 'mapped'
            | 'ready'
            | 'deployed'
            | 'failed';
          total_rows?: number | null;
          uploaded_by?: number | null;
          error_message?: string | null;
          metadata?: unknown | null;
        };
        Update: {
          upload_status?:
            | 'uploaded'
            | 'staged'
            | 'mapped'
            | 'ready'
            | 'deployed'
            | 'failed';
          total_rows?: number | null;
          processed_at?: string | null;
          deployed_at?: string | null;
          error_message?: string | null;
          metadata?: unknown | null;
        };
      };
      data_field_mappings: {
        Row: {
          mapping_id: number;
          upload_id: number;
          source_column: string;
          target_table: string;
          target_column: string;
          transformation_rule: string | null;
          is_required: boolean;
          created_date: string;
          created_by: number | null;
        };
        Insert: {
          upload_id: number;
          source_column: string;
          target_table: string;
          target_column: string;
          transformation_rule?: string | null;
          is_required?: boolean;
          created_by?: number | null;
        };
        Update: {
          source_column?: string;
          target_table?: string;
          target_column?: string;
          transformation_rule?: string | null;
          is_required?: boolean;
        };
      };
      data_staging: {
        Row: {
          staging_id: number;
          upload_id: number;
          row_number: number;
          raw_data: unknown;
          validation_status: 'pending' | 'valid' | 'invalid';
          validation_errors: string[] | null;
          created_date: string;
        };
        Insert: {
          upload_id: number;
          row_number: number;
          raw_data: unknown;
          validation_status?: 'pending' | 'valid' | 'invalid';
          validation_errors?: string[] | null;
        };
        Update: {
          validation_status?: 'pending' | 'valid' | 'invalid';
          validation_errors?: string[] | null;
        };
      };
    };
  };
};
