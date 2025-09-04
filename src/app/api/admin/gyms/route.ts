import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';
import { normalizeEquipmentName } from '@/app/features/gym/equipmentAliases';
import { loadServerExercises } from '@/app/services/server-exercises';

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

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const snap = await adminDb.collection('gyms').where('ownerId', '==', auth.uid).get();
  const gyms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ gyms });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { name, slug, brand, equipment } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Build canonical equipment set from exercises
  const bodyParts = ['Shoulders','Upper Arms','Forearms','Chest','Abdomen','Upper Back','Lower Back','Glutes','Upper Legs','Lower Legs','Warmup','Cardio'];
  const allExercises = await loadServerExercises({ bodyParts, includeBodyweightWarmups: true });
  const canonical = new Set<string>();
  for (const ex of allExercises) {
    for (const item of ex.equipment || []) {
      canonical.add(normalizeEquipmentName(String(item)));
    }
  }
  canonical.add('Bodyweight');

  const normalizedEq: string[] = Array.isArray(equipment)
    ? equipment
        .map((e: string) => normalizeEquipmentName(String(e)))
        .filter((e: string) => canonical.has(e))
    : [];

  // Enforce global unique slug
  const existing = await adminDb.collection('gyms').where('slug', '==', slug).limit(1).get();
  if (!existing.empty) {
    // Upsert if same owner uses same slug, else reject
    const doc = existing.docs[0];
    const data = doc.data() as any;
    if (data.ownerId !== auth.uid) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
    await doc.ref.set(
      {
        name,
        slug,
        brand: brand || null,
        equipment: normalizedEq,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return NextResponse.json({ id: doc.id });
  }

  const now = new Date().toISOString();
  const ref = await adminDb.collection('gyms').add({
    ownerId: auth.uid,
    name,
    slug,
    brand: brand || null,
    equipment: normalizedEq,
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ id: ref.id });
}


