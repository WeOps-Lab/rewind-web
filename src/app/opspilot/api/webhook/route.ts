import { NextRequest, NextResponse } from 'next/server';

export const GET = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};

export const POST = async (req: NextRequest) => {
  try {
    const { sender, message, port } = await req.json();
    const payload = { sender, message };

    const backendResponse = await fetch(`http://104.215.58.237:${port}/webhooks/rest/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!backendResponse.ok) {
      return NextResponse.json({ message: 'Network response was not ok' }, { status: backendResponse.status });
    }

    const json = await backendResponse.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('Fetch failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

export const PUT = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};

export const DELETE = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};
