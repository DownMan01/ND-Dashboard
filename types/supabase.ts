export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      airdrop_collections: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          name: string
          subtitle: string
          image_url: string | null
          description: string | null
          backers: string[]
          chain: string
          cost: number | null
          stage: "Active" | "Upcoming" | "Ended"
          requirements: Json
          how_to_steps: Json
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name: string
          subtitle: string
          image_url?: string | null
          description?: string | null
          backers?: string[]
          chain: string
          cost?: number | null
          stage?: "Active" | "Upcoming" | "Ended"
          requirements?: Json
          how_to_steps?: Json
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string
          subtitle?: string
          image_url?: string | null
          description?: string | null
          backers?: string[]
          chain?: string
          cost?: number | null
          stage?: "Active" | "Upcoming" | "Ended"
          requirements?: Json
          how_to_steps?: Json
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

