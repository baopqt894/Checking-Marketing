import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL || 'http://localhost:2703';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    const appId = params.appId;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/app-info/${appId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to update app' },
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
