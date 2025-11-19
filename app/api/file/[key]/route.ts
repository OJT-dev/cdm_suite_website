
import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl } from '@/lib/s3';


export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);
    
    // Get signed URL
    const url = await getFileUrl(key, 3600); // 1 hour expiration

    // Redirect to signed URL
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}
