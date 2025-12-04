'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

type Gym = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  brand?: { color?: string; logoUrl?: string };
  equipment: string[];
  token?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminGymsPage() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', color: '', logoUrl: '', equipmentCsv: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  type EquipmentOption = { name: string; count: number };
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const canUse = useMemo(() => Boolean(uid), [uid]);

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', ...(uid ? { 'X-UID': uid } : {}) }), [uid]);

  const load = async () => {
    if (!uid) return;
    setErr(null);
    try {
      const res = await fetch('/api/admin/gyms', { headers });
      // Treat auth issues separately; empty datasets are normal
      if (res.status === 401) {
        // Not logged in (should be guarded elsewhere); no error banner
        return;
      }
      if (res.status === 403) {
        // Logged in but not admin; don't show error banner here
        setGyms([]);
        return;
      }
      if (!res.ok) {
        setErr('Failed to load gyms');
        return;
      }
      const data = await res.json();
      setGyms(Array.isArray(data.gyms) ? data.gyms as Gym[] : []);
    } catch {
      setErr('Failed to load gyms');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [uid]);

  // Load canonical equipment options
  useEffect(() => {
    const run = async () => {
      if (!uid) return;
      try {
        const res = await fetch('/api/admin/equipment', { headers });
        if (!res.ok) return; // silent; options remain empty
        const data = await res.json();
        setEquipmentOptions(Array.isArray(data.equipment) ? data.equipment : []);
      } catch {
        // ignore
      }
    };
    void run();
  }, [uid, headers]);

  const upsert = async () => {
    if (!uid || !form.name || !form.slug) return;
    setBusy(true); setErr(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        brand: { color: form.color || undefined, logoUrl: form.logoUrl || undefined },
        equipment: selectedEquipment,
      };
      const res = await fetch('/api/admin/gyms', { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        if (res.status === 409) {
          setErr('Slug already in use');
          return;
        }
        if (res.status === 400) {
          setErr('Please fill in required fields');
          return;
        }
        if (res.status === 403) {
          setErr('You do not have permission to save gyms');
          return;
        }
        throw new Error(`${res.status}`);
      }
      await load();
      setForm({ name: '', slug: '', color: '', logoUrl: '', equipmentCsv: '' });
      setSelectedEquipment([]);
      setSlugTouched(false);
    } catch {
      setErr('Failed to save gym');
    } finally { setBusy(false); }
  };

  const genQr = async (slug: string) => {
    if (!uid) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/gyms/${encodeURIComponent(slug)}/qr`, { method: 'POST', headers });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      alert(`Short URL: ${data.shortUrl}`);
      // Offer download
      const a = document.createElement('a');
      a.href = data.qrPngDataUrl;
      a.download = `${slug}-qr.svg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {
      setErr('Failed to generate QR');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6">Loading…</div>;
  if (!canUse) return <div className="min-h-screen bg-gray-900 text-white p-6">Please log in to manage gyms.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">Admin · Gyms</h1>
        {err && <div className="p-3 rounded bg-red-600/20 text-red-300">{err}</div>}

        <div className="bg-gray-800/50 rounded-xl ring-1 ring-gray-700/50 p-4">
          <h2 className="font-medium mb-3">Create / Update Gym</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                className="px-3 py-2 rounded bg-gray-900/60 w-full"
                placeholder="Gym name"
                value={form.name}
                onChange={(e)=>{
                  const name = e.target.value;
                  setForm({...form,name});
                  if (!slugTouched) {
                    const gen = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g,'-')
                      .replace(/^-+|-+$/g,'');
                    setForm((f)=>({...f, slug: gen }));
                  }
                }}
              />
            </div>
            <div>
              <input
                className="px-3 py-2 rounded bg-gray-900/60 w-full"
                placeholder="Public link id (slug)"
                value={form.slug}
                onChange={(e)=>{ setForm({...form,slug:e.target.value}); setSlugTouched(true); }}
              />
              <div className="mt-1 text-xs text-gray-500">Used in links like /g/{form.slug || 'your-gym'}</div>
            </div>
            <input className="px-3 py-2 rounded bg-gray-900/60" placeholder="Brand color (#hex)" value={form.color} onChange={(e)=>setForm({...form,color:e.target.value})} />
            <input className="px-3 py-2 rounded bg-gray-900/60" placeholder="Logo URL" value={form.logoUrl} onChange={(e)=>setForm({...form,logoUrl:e.target.value})} />
            <div className="md:col-span-2">
              <div className="mb-2 text-sm text-gray-300">Available Equipment</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-auto p-2 rounded bg-gray-900/60">
                {equipmentOptions.map((opt, idx) => {
                  const checked = selectedEquipment.includes(opt.name);
                  return (
                    <label key={opt.name} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-indigo-500"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedEquipment((prev) =>
                            e.target.checked ? [...prev, opt.name] : prev.filter((x) => x !== opt.name)
                          );
                        }}
                      />
                      <span>
                        {opt.name}{' '}
                        <span className="text-gray-500">
                          ({idx === 0 ? `${opt.count} exercises` : opt.count})
                        </span>
                      </span>
                    </label>
                  );
                })}
                {equipmentOptions.length === 0 && (
                  <div className="text-gray-500 col-span-2">No equipment options</div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button disabled={busy} onClick={upsert} className="px-4 py-2 rounded bg-indigo-600 disabled:opacity-50">{busy? 'Saving…':'Save Gym'}</button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl ring-1 ring-gray-700/50 p-4">
          <h2 className="font-medium mb-3">Your Gyms</h2>
          {gyms.length === 0 && <div className="text-gray-400">No gyms yet.</div>}
          <div className="space-y-3">
            {gyms.map((g)=> (
              <div key={g.id} className="p-3 rounded bg-gray-900/60 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">{g.name} <span className="text-xs text-gray-400">/g/{g.slug}</span></div>
                  <div className="text-xs text-gray-400">{(g.equipment||[]).join(', ')}</div>
                </div>
                <button disabled={busy} onClick={()=>genQr(g.slug)} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50">Generate QR</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


