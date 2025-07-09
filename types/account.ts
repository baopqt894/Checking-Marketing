import { AppInfo } from "./app"

export interface Token {
  _id: string
  isActive: boolean
  deleted_at: string | null
  deleted_by: string | null
  created_by: string | null
  update_by: string | null
  email: string
  google_client_id: string
  google_client_secret: string
  google_redirect_uri: string
  publisher_ids: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  __v: number
  access_token: string
  refresh_token: string
  id: string
}

export interface Account {
  _id: string
  isActive: boolean
  deleted_at: string | null
  deleted_by: string | null
  created_by: string | null
  update_by: string | null
  name: string
  email_private: string
  email_company: string
  isLeader: boolean
  appInfos: (string | AppInfo)[]
  created_at: string
  updated_at: string
  __v: number
  id: string
}
