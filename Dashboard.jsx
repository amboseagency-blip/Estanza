import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, MessageCircle, Copy, Pencil, Trash2, Link2, PauseCircle, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import { formatPrice, CURRENCIES } from './pricing';
import { sliderToMeters, formatDistance, colorForIndex } from './facilities';
import { getPropertyLimit, splitActiveHeld } from './planLimits';

export default function Dashboard() {
  const { profile, updateProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // null | 'add' | property object being edited
  const [deletingId, setDeletingId] = useState(null);
  const [showLimitNotice, setShowLimitNotice] = useState(false);

  async function loadProperties() {
    if (!profile) return;
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('broker_id', profile.id)
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleDelete(id) {
    setDeletingId(id);
    await supabase.from('properties').delete().eq('id', id);
    setDeletingId(null);
    loadProperties();
  }

  if (!profile) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</div>;

  const catalogLink = `${window.location.origin}/broker/${profile.id}`;
  const limit = getPropertyLimit(profile);
  const { held } = splitActiveHeld(properties, limit);
  const heldIds = new Set(held.map((p) => p.id));
  const atLimit = limit !== Infinity && properties.length >= limit;

  function handleAddClick() {
    if (atLimit) {
      setShowLimitNotice(true);
      return;
    }
    setModalMode('add');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-9">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="font-display text-2xl">Welcome, {profile.display_name?.split(' ')[0]}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Plan: {profile.plan || 'free'} · {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
            {held.length > 0 ? ` · ${held.length} on hold` : ''}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={profile.currency}
            onChange={(e) => updateProfile({ currency: e.target.value })}
            className="text-sm px-2 py-2 rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {Object.keys(CURRENCIES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}
          >
            <Plus size={15} /> Add property
          </button>
        </div>
      </div>

      {showLimitNotice && (
        <div className="rounded-xl p-4 mb-6 border flex flex-wrap items-center justify-between gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: '#ef4444' }}>
          <p className="text-sm">
            You've reached your <strong>{profile.plan || 'free'}</strong> plan limit of {limit} propert{limit === 1 ? 'y' : 'ies'}.
            Upgrade to add more.
          </p>
          <div className="flex gap-2 shrink-0">
            <a href="/pricing" className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#ef4444', color: '#fff' }}>
              Upgrade
            </a>
            <button
              onClick={() => setShowLimitNotice(false)}
              className="px-3 py-1.5 rounded-lg text-xs border"
              style={{ borderColor: 'var(--border)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {held.length > 0 && (
        <div className="rounded-xl p-4 mb-6 border" style={{ background: 'rgba(234,179,8,0.08)', borderColor: '#eab308' }}>
          <p className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <PauseCircle size={14} /> {held.length} propert{held.length === 1 ? 'y is' : 'ies are'} on hold
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your plan isn't active right now, so your newest listings are hidden from your public catalog.
            They'll unlock automatically the moment your subscription is active again.
          </p>
          <a href="/pricing" className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
            Reactivate plan
          </a>
        </div>
      )}

      <div className="rounded-2xl p-5 mb-6 border"
        style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface2))', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Link2 size={15} style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-semibold">Your public catalog link</p>
        </div>
        <p className="text-xs break-all mb-4" style={{ color: 'var(--text-muted)' }}>{catalogLink}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(catalogLink)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: 'var(--border)' }}
          >
            <Copy size={13} /> Copy link
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent('Check out my property catalog: ' + catalogLink)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold"
            style={{ background: '#25D366', color: '#fff' }}
          >
            <MessageCircle size={13} /> Share on WhatsApp
          </a>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading properties…</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          No properties yet. Click "Add property" to create your first listing.
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
          {properties.map((p) => {
            const isHeld = heldIds.has(p.id);
            return (
              <div key={p.id} className="rounded-xl overflow-hidden border relative"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', opacity: isHeld ? 0.6 : 1 }}>
                {isHeld && (
                  <span className="absolute top-2 left-2 z-10 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#eab308', color: '#000' }}>
                    <PauseCircle size={10} /> On hold
                  </span>
                )}
                <img src={p.images?.[0]} alt={p.title} className="w-full h-32 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-semibold truncate">{p.title}</p>
                  <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                    {formatPrice(p.price, p.currency)} · {p.location}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                    <button
                      onClick={() => setModalMode(p)}
                      className="flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg border"
                      style={{ borderColor: 'var(--border)', color: '#ef4444', opacity: deletingId === p.id ? 0.5 : 1 }}
                    >
                      <Trash2 size={12} /> {deletingId === p.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>

                  {isHeld ? (
                    <p className="text-xs text-center py-2 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      Hidden from catalog — upgrade to unlock
                    </p>
                  ) : (
                    <a
                      href={`https://wa.me/${profile.whatsapp_number || ''}?text=${encodeURIComponent(
                        `Sharing my listing: ${p.title} — ${window.location.origin}/property/${p.id}`
                      )}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg"
                      style={{ background: '#25D366', color: '#fff' }}
                    >
                      <MessageCircle size={13} /> Share on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalMode && (
        <PropertyModal
          brokerId={profile.id}
          currency={profile.currency}
          existing={modalMode === 'add' ? null : modalMode}
          onClose={() => setModalMode(null)}
          onSaved={() => { setModalMode(null); loadProperties(); }}
        />
      )}
    </div>
  );
}

function PropertyModal({ brokerId, currency, existing, onClose, onSaved }) {
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title || '');
  const [price, setPrice] = useState(existing?.price?.toString() || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [videoUrl, setVideoUrl] = useState(existing?.video_url || '');
  const [existingImages, setExistingImages] = useState(existing?.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [facilityTags, setFacilityTags] = useState(existing?.facility_tags || []);
  const [facName, setFacName] = useState('');
  const [facSlider, setFacSlider] = useState(30);

  const totalImages = existingImages.length + newFiles.length;
  const facilitySuggestions = ['School', 'Hospital', 'Metro station', 'Mall', 'Restaurant', 'Airport'];

  function handleFilesSelected(e) {
    const picked = Array.from(e.target.files);
    const room = Math.max(0, 30 - existingImages.length - newFiles.length);
    const accepted = picked.slice(0, room);
    setNewFiles([...newFiles, ...accepted]);
    setNewPreviews([...newPreviews, ...accepted.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeNewFile(i) {
    setNewFiles(newFiles.filter((_, idx) => idx !== i));
    setNewPreviews(newPreviews.filter((_, idx) => idx !== i));
  }

  function removeExistingImage(url) {
    setExistingImages(existingImages.filter((u) => u !== url));
  }

  function addFacility(name) {
    const finalName = (name || facName).trim();
    if (!finalName) return;
    const meters = sliderToMeters(facSlider);
    const color = colorForIndex(facilityTags.length);
    setFacilityTags([...facilityTags, { id: Date.now(), name: finalName, meters, color }]);
    setFacName('');
    setFacSlider(30);
  }

  function removeFacility(id) {
    setFacilityTags(facilityTags.filter((f) => f.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const uploadedUrls = [];
      for (const file of newFiles) {
        const path = `${brokerId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('property-images').upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('property-images').getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
      }

      const payload = {
        title,
        price: Number(price) || 0,
        currency,
        location,
        description,
        video_url: videoUrl || null,
        images: [...existingImages, ...uploadedUrls],
        facilities: facilityTags.map((f) => `${f.name} — ${formatDistance(f.meters)}`),
        facility_tags: facilityTags.map(({ name, meters, color }) => ({ name, meters, color })),
      };

      if (isEdit) {
        const { error: updErr } = await supabase.from('properties').update(payload).eq('id', existing.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from('properties').insert({ broker_id: brokerId, ...payload });
        if (insErr) throw insErr;
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-5 z-50" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

        <div className="sticky top-0 flex justify-between items-center px-6 py-4 border-b z-10"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
          <h3 className="font-display text-xl">{isEdit ? 'Edit property' : 'Add property'}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: 'var(--border)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <SectionLabel>Basics</SectionLabel>
          <Field label="Title" value={title} onChange={setTitle} placeholder="1BHK Apartment, Bandra West" />
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Price (${currency})`} value={price} onChange={setPrice} placeholder="180000" />
            <Field label="Location" value={location} onChange={setLocation} placeholder="Mount Mary Hill, Mumbai" />
          </div>

          <SectionLabel>{`Add image (${totalImages}/30)`}</SectionLabel>
          <div className="flex flex-wrap gap-3 mb-6">
            {existingImages.map((url) => (
              <div key={url} className="relative w-20 h-20 shrink-0">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                <button
                  onClick={() => removeExistingImage(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#ef4444' }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {newPreviews.map((url, i) => (
              <div key={url} className="relative w-20 h-20 shrink-0">
                <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                <button
                  onClick={() => removeNewFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#ef4444' }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {totalImages < 30 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center shrink-0"
                style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
                aria-label="Add images"
              >
                <Plus size={22} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFilesSelected} className="hidden" />

          <SectionLabel>Add video (optional)</SectionLabel>
          <div className="rounded-xl border-2 border-dashed p-4 mb-6 flex items-center gap-3"
            style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
            <Video size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a walkthrough video link (YouTube, Drive, etc.)"
              className="flex-1 bg-transparent text-sm outline-none min-w-0"
              style={{ color: 'var(--text)' }}
            />
          </div>

          <SectionLabel>Description</SectionLabel>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the property — this is what leads see when they tap 'Show more'. Press Enter twice between paragraphs for clean formatting."
            className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none mb-6"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />

          <SectionLabel>Near facilities</SectionLabel>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Tag nearby schools, hospitals, malls, restaurants — anything that helps a lead picture the area.
          </p>

          {facilityTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {facilityTags.map((f) => (
                <span key={f.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: f.color, color: '#0a0a0c' }}>
                  {f.name} · {formatDistance(f.meters)}
                  <X size={11} className="cursor-pointer" onClick={() => removeFacility(f.id)} />
                </span>
              ))}
            </div>
          )}

          <div className="rounded-xl border-2 border-dashed p-4 mb-6" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {facilitySuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addFacility(s)}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  + {s}
                </button>
              ))}
            </div>
            <input
              value={facName}
              onChange={(e) => setFacName(e.target.value)}
              placeholder="Or type a custom place…"
              className="w-full mb-3 px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Distance</span>
              <span className="text-xs font-semibold">{formatDistance(sliderToMeters(facSlider))}</span>
            </div>
            <input type="range" min={0} max={100} value={facSlider} onChange={(e) => setFacSlider(Number(e.target.value))} className="w-full mb-1" />
            <div className="flex justify-between text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>50m</span><span>100km</span>
            </div>
            <button
              type="button"
              onClick={() => addFacility()}
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              <Plus size={12} /> Add facility
            </button>
          </div>

          {error && <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !title}
            className="w-full py-3 rounded-lg font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save property'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-base font-semibold mt-6 mb-3 first:mt-0" style={{ color: 'var(--text)' }}>
      {children}
    </p>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
        style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
    </div>
  );
}
