export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  theme_settings: Json | null
  created_at: string
  updated_at: string
}

export interface ContactMethod {
  id: string
  profile_id: string
  type: string
  label: string
  value: string
  icon: string | null
  enabled: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
