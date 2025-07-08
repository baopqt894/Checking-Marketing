"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

import type { Token } from "@/types/token"
import TokenTable from "@/components/tokenManagement/token-table"
import TokenModal from "@/components/tokenManagement/token-modal"
import TokenEditModal from "@/components/tokenManagement/token-edit-modal"
import TokenViewModal from "@/components/tokenManagement/token-view-modal"

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
        const response = await fetch(`${apiUrl}tokens`)
        if (response.ok) {
          const data = await response.json()
          setTokens(data)
        }
      } catch (error) {
        console.error("Failed to fetch tokens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [])

  const handleAddToken = async (newToken: Token) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
      const response = await fetch(`${apiUrl}tokens/add-new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newToken),
      })

      if (response.ok) {
        const createdToken = await response.json()
        setTokens((prev) => [...prev, createdToken])
        setIsModalOpen(false)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create token")
      }
    } catch (error) {
      console.error("Error adding token:", error)
      alert("Failed to add token. Please try again.")
    }
  }

  const handleEditToken = async (
    id: string,
    updatedData: {
      google_client_id: string
      google_client_secret: string
      google_redirect_uri: string
    },
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
      const response = await fetch(`${apiUrl}/tokens/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedToken = await response.json()
        setTokens((prev) => prev.map((token) => (token.id === id ? updatedToken : token)))
        setIsEditModalOpen(false)
        setSelectedToken(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update token")
      }
    } catch (error) {
      console.error("Error updating token:", error)
      alert("Failed to update token. Please try again.")
    }
  }

  const handleOpenEditModal = (token: Token) => {
    setSelectedToken(token)
    setIsEditModalOpen(true)
  }

  const handleOpenViewModal = (token: Token) => {
    setSelectedToken(token)
    setIsViewModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Token Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Token
        </Button>
      </div>

      <TokenTable tokens={tokens} isLoading={isLoading} onEdit={handleOpenEditModal} onView={handleOpenViewModal} />

      <TokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddToken} />

      <TokenEditModal
        isOpen={isEditModalOpen}
        token={selectedToken}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedToken(null)
        }}
        onSubmit={handleEditToken}
      />

      <TokenViewModal
        isOpen={isViewModalOpen}
        token={selectedToken}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedToken(null)
        }}
      />
    </div>
  )
}
