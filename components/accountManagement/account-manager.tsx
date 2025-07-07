"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { PlusCircle, Trash, Edit, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { EnvConfigModal } from "./env-config-modal"
import { AccountCard } from "./account-card"

interface Token {
    _id: string
    email: string
    access_token: string
    refresh_token: string
    google_client_id?: string
    google_client_secret?: string
    google_redirect_uri?: string
    publisher_ids?: string[]
    currency_code?: string
    reporting_time_zone?: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  

export function AccountManager() {
    const [tokens, setTokens] = useState<Token[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedToken, setSelectedToken] = useState<Token | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL!;
    useEffect(() => {
        const fetchTokens = async () => {
          try {
            const response = await fetch(`${apiUrl}/tokens`)
            if (!response.ok) {
              throw new Error("Failed to fetch tokens")
            }
            const data = await response.json()
            setTokens(data)
          } catch (error) {
            console.error("Error fetching tokens:", error)
          } finally {
            setLoading(false)
          }
        }
    
        fetchTokens()
      }, [])

  const handleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard/accounts",
      redirect: false,
    })
  }
  const handleCardClick = (token: Token) => {
    setSelectedToken(token)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedToken(null)
  }

  const handleTokenUpdate = (updatedToken: Token) => {
    setTokens(tokens.map((token) => (token._id === updatedToken._id ? updatedToken : token)))
  }
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading accounts...</span>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Google Accounts</h2>
        <Button onClick={handleLogin}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>
      {tokens.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No accounts found. Please add an account to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <AccountCard key={token._id} token={token} onClick={() => handleCardClick(token)} />
          ))}
        </div>
      )}

      {selectedToken && (
        <EnvConfigModal
          token={selectedToken}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleTokenUpdate}
        />
      )}
    </div>
  )
}

