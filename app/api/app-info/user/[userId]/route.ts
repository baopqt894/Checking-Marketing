import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703';

export async function GET(request: NextRequest) {
  try {
    // Extract userId from the URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const userId = segments[segments.length - 1];

    const response = await fetch(`${API_BASE_URL}/app-info/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to fetch user apps' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
