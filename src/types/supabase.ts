export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      store_settings: {
        Row: {
          id: string
          store_name: string
          location: string | null
          phone_number: string | null
          logo_url: string | null
          business_hours: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_name?: string
          location?: string | null
          phone_number?: string | null
          logo_url?: string | null
          business_hours?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_name?: string
          location?: string | null
          phone_number?: string | null
          logo_url?: string | null
          business_hours?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      },
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string
          barcode: string | null
          category_id: string
          unit_price: number
          unit: string
          quantity_in_stock: number
          min_stock_level: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku: string
          barcode?: string | null
          category_id: string
          unit_price: number
          unit: string
          quantity_in_stock: number
          min_stock_level: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sku?: string
          barcode?: string | null
          category_id?: string
          unit_price?: number
          unit?: string
          quantity_in_stock?: number
          min_stock_level?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_transactions: {
        Row: {
          id: string
          product_id: string
          quantity: number
          transaction_type: string
          notes: string | null
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          transaction_type: string
          notes?: string | null
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          transaction_type?: string
          notes?: string | null
          transaction_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          title: string
          description: string | null
          report_type: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          report_type: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          report_type?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Buckets: {
      Row: {
        id: string
        name: string
        owner: string | null
        created_at: string | null
        updated_at: string | null
        public: boolean | null
        avif_autodetection: boolean | null
        file_size_limit: number | null
        allowed_mime_types: string[] | null
      }
    }
    Objects: {
      Row: {
        id: string
        bucket_id: string
        name: string
        owner: string | null
        created_at: string | null
        updated_at: string | null
        last_accessed_at: string | null
        metadata: Json | null
        path_tokens: string[] | null
      }
    }
  }
}
