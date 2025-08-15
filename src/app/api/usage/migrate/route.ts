import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { migrateAnonUsageToUserAndResetLimit } from '@/app/api/assistant/openai-server';

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ ok: false, error: 'missing_uid' }, { status: 400 });

    const cookieStore = await cookies();
    const anonId = cookieStore.get('musco_anon_id')?.value;
    if (!anonId) {
      return NextResponse.json({ ok: true, migrated: false });
    }

    const migrated = await migrateAnonUsageToUserAndResetLimit(anonId, uid);
    return NextResponse.json({ ok: true, migrated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}



