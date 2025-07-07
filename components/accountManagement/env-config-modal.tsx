"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";

interface Token {
  _id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  google_client_id?: string;
  google_client_secret?: string;
  google_redirect_uri?: string;
  publisher_ids?: string[];
  currency_code?: string;
  reporting_time_zone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnvConfigModalProps {
  token: Token;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedToken: Token) => void;
}

export function EnvConfigModal({
  token,
  isOpen,
  onClose,
  onUpdate,
}: EnvConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReloginLoading, setIsReloginLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL!;
  const [envVars, setEnvVars] = useState([
    {
      key: "GOOGLE_CLIENT_ID",
      value: token.google_client_id || "",
    },
    {
      key: "GOOGLE_CLIENT_SECRET",
      value: token.google_client_secret || "",
    },
    {
      key: "GOOGLE_REDIRECT_URI",
      value: token.google_redirect_uri || "",
    },
  ]);

  const updateEnvVar = (index: number, key: string, value: string) => {
    setEnvVars((prev) =>
      prev.map((item, i) => (i === index ? { ...item, key, value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/tokens/${token._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          google_client_id: envVars[0].value,
          google_client_secret: envVars[1].value,
          google_redirect_uri: envVars[2].value,
        }),
      });

      if (!response.ok) throw new Error("Failed to update token");

      const updatedData = await response.json();
      onUpdate(updatedData);
      toast.success("Your account configuration has been updated.");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelogin = async () => {
    setIsReloginLoading(true);
    try {
      const response = await fetch(`${apiUrl}/tokens/${token._id}/relogin`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to relogin");

      const updatedToken = await response.json();
      onUpdate(updatedToken);
      toast.success("Relogin successful. Token refreshed.");
    } catch (error) {
      console.error(error);
      toast.error("Relogin failed. Please try again.");
    } finally {
      setIsReloginLoading(false);
    }
  };

  function useGoogleTokenTTL(accessToken: string | null) {
    const [ttl, setTtl] = useState<string>("Loading...");

    useEffect(() => {
      if (!accessToken) return;

      fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.expires_in) {
            const seconds = parseInt(data.expires_in);
            const minutes = Math.floor(seconds / 60);
            setTtl(`${minutes} minutes`);
          } else {
            setTtl("Unavailable");
          }
        })
        .catch(() => setTtl("Unavailable"));
    }, [accessToken]);

    return ttl;
  }
  const ttl = useGoogleTokenTTL(token.access_token);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl space-y-6">
        <DialogHeader>
          <DialogTitle>Account Configuration</DialogTitle>
          <DialogDescription>
            Set environment variables for <strong>{token.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="token">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="token">Token</TabsTrigger>
            <TabsTrigger value="publisher">Publisher</TabsTrigger>
            <TabsTrigger value="ttlToken">TTL Token</TabsTrigger>
          </TabsList>

          <TabsContent value="token" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {envVars.map((envVar, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center gap-2"
                >
                  <Input
                    value={envVar.key}
                    readOnly
                    className="w-full sm:w-1/2"
                  />
                  <Input
                    value={envVar.value}
                    onChange={(e) =>
                      updateEnvVar(index, envVar.key, e.target.value)
                    }
                    className="w-full sm:w-1/2"
                    type={envVar.key.includes("SECRET") ? "password" : "text"}
                  />
                </div>
              ))}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRelogin}
                  disabled={isReloginLoading}
                  className="w-full sm:w-auto"
                >
                  {isReloginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Relogging...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Relogin
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="publisher" className="pt-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Publisher IDs</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {token.publisher_ids?.length ? (
                  token.publisher_ids.map((id, idx) => <li key={idx}>{id}</li>)
                ) : (
                  <li>No publisher IDs available</li>
                )}
              </ul>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Currency:</strong>{" "}
                {token.currency_code || <span className="text-muted">N/A</span>}
              </p>
              <p>
                <strong>Time Zone:</strong>{" "}
                {token.reporting_time_zone || (
                  <span className="text-muted">N/A</span>
                )}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ttlToken" className="pt-4 space-y-4">
            <div>
              <label>Access Token</label>
              <Input value={token.access_token} readOnly type="password" />

              <label>Refresh Token</label>
              <Input value={token.refresh_token} readOnly type="password" />

              <p className="text-sm text-muted-foreground">TTL: {ttl}</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
