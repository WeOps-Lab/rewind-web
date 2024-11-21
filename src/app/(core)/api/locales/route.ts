import { NextRequest, NextResponse } from 'next/server';
import { getMergedMessages } from '@/utils/mergedMessage';

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') === 'en' ? 'en' : 'zh';
    const mergedMessages = await getMergedMessages();
    return NextResponse.json(mergedMessages[locale], { status: 200 });
  } catch (error) {
    console.error('Failed to load locales:', error);
    return NextResponse.json({ message: 'Failed to load locales', error }, { status: 500 });
  }
};

export const POST = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};