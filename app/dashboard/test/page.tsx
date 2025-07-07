'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { getGoogleAuthUrl } from '@/lib/googleAuth';

type AdmobAccount = {
  name: string;
  publisherId: string;
  currencyCode: string;
};

export default function AdmobPage() {
  const [accounts, setAccounts] = useState<AdmobAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('access_token');

    if (!token) {
      // Chưa có token => redirect login
      window.location.href = getGoogleAuthUrl();
      return;
    }

    const fetchAdmobAccounts = async () => {
      try {
        const res = await fetch('https://admob.googleapis.com/v1/accounts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Google API error: ${res.status}`);
        }

        const data = await res.json();
        setAccounts(data.account || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmobAccounts();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">🎯 AdMob Accounts</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">❌ {error}</p>}

      {!loading && accounts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {accounts.map((account) => (
            <li key={account.name} className="border p-4 rounded bg-white shadow">
              <p><strong>Name:</strong> {account.name}</p>
              <p><strong>Publisher ID:</strong> {account.publisherId}</p>
              <p><strong>Currency:</strong> {account.currencyCode}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && accounts.length === 0 && <p>No accounts found.</p>}
    </main>
  );
}
