import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';

async function requireAuth(req: NextRequest): Promise<{ uid: string; isAdmin: boolean } | null> {
  const uid = req.headers.get('x-uid');
  if (!uid) return null;
  try {
    const snap = await adminDb.collection('users').doc(uid).get();
    const data = snap.exists ? (snap.data() as any) : null;
    const roles: string[] = Array.isArray(data?.roles) ? data.roles : [];
    const isAdmin = Boolean(data?.isGymAdmin) || roles.includes('gym_admin');
    return { uid, isAdmin };
  } catch {
    return { uid, isAdmin: false };
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { slug } = await params;
  const snap = await adminDb.collection('gyms').where('slug', '==', slug).limit(1).get();
  if (snap.empty) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const doc = snap.docs[0];
  const data = doc.data() as any;
  if (data.ownerId !== auth.uid) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const token = uuidv4();
  await doc.ref.set({ token, updatedAt: new Date().toISOString() }, { merge: true });

  const shortUrl = `https://bodai.no/g/${encodeURIComponent(slug)}?t=${encodeURIComponent(token)}`;
  // Simple QR using third-party encoder API-free: data URL via SVG
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10'>SCAN:${shortUrl}</text></svg>`;
  const qrPngDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return NextResponse.json({ shortUrl, qrPngDataUrl });
}


