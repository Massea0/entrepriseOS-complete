// Types générés par Supabase (simplifiés pour le développement)
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company_id: string | null;
          role: string;
          onboarding_completed: boolean;
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          company_id: string;
          created_at: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          project_id: string;
          assignee_id: string | null;
          created_at: string;
        };
      };
    };
  };
}