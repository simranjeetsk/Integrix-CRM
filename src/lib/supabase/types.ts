export type ClientStage =
  | "enquiry"
  | "discovery"
  | "proposal"
  | "onboarding"
  | "execution"
  | "review";

export type EnquiryStatus = "open" | "in_progress" | "quoted" | "closed";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          company_name: string;
          address: string | null;
          stage: ClientStage;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          address?: string | null;
          stage?: ClientStage;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          client_id: string;
          source: string | null;
          requirement_summary: string | null;
          status: EnquiryStatus;
          received_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          source?: string | null;
          requirement_summary?: string | null;
          status?: EnquiryStatus;
          received_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "enquiries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      rate_cards: {
        Row: {
          id: string;
          zone: string;
          skill_category: string;
          basic: number;
          da: number;
          hra_pct: number;
          pf_employee_pct: number;
          pf_employer_epf_pct: number;
          pf_employer_edli_pct: number;
          pf_employer_admin_pct: number;
          esic_employee_pct: number;
          esic_employer_pct: number;
          esic_ceiling: number;
          bonus_pct: number;
          mlwf_employer: number;
          professional_tax: number;
          service_charge_pct: number;
          effective_from: string;
          effective_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          zone: string;
          skill_category: string;
          basic: number;
          da?: number;
          hra_pct?: number;
          pf_employee_pct?: number;
          pf_employer_epf_pct?: number;
          pf_employer_edli_pct?: number;
          pf_employer_admin_pct?: number;
          esic_employee_pct?: number;
          esic_employer_pct?: number;
          esic_ceiling?: number;
          bonus_pct?: number;
          mlwf_employer?: number;
          professional_tax?: number;
          service_charge_pct?: number;
          effective_from: string;
          effective_to?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rate_cards"]["Insert"]>;
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          enquiry_id: string;
          rate_card_id: string;
          status: QuotationStatus;
          gst_pct: number;
          total_manpower_cost: number;
          total_cost_to_company: number;
          generated_at: string;
          created_by: string | null;
          pdf_path: string | null;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          rate_card_id: string;
          status?: QuotationStatus;
          gst_pct?: number;
          total_manpower_cost?: number;
          total_cost_to_company?: number;
          generated_at?: string;
          created_by?: string | null;
          pdf_path?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quotations_enquiry_id_fkey";
            columns: ["enquiry_id"];
            isOneToOne: false;
            referencedRelation: "enquiries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_rate_card_id_fkey";
            columns: ["rate_card_id"];
            isOneToOne: false;
            referencedRelation: "rate_cards";
            referencedColumns: ["id"];
          },
        ];
      };
      quotation_lines: {
        Row: {
          id: string;
          quotation_id: string;
          role: string;
          nos: number;
          cost_per_no: number;
          line_total: number;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          role: string;
          nos: number;
          cost_per_no: number;
          line_total: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["quotation_lines"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "quotation_lines_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
