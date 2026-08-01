import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BadgeCheck, Camera, Check, Send, Trash2, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

export default function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) {
    return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-9">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm mb-5"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <h2 className="font-display text-2xl mb-1">Settings</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Manage your profile, subscription, and account.
      </p>

      <ProfileSection profile={profile} updateProfile={updateProfile} />
      <SubscriptionSection profile={profile} />
      <FeedbackSection profile={profile} />
      <DangerZone signOut={signOut} navigate={navigate} />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl p-5 mb-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function ProfileSection({ profile, updateProfile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp_number || '');
  const [agencyName, setAgencyName] = useState(profile.agency_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const path = `${profile.id}/avatar-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('property-images').upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('property-images').getPublicUrl(path);
      setPhotoUrl(pub.publicUrl);
    } catch (err) {
      setError(err.message || 'Could not upload photo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({
        display_name: displayName,
        whatsapp_number: whatsapp,
        agency_name: agencyName,
        bio,
        photo_url: photoUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Profile">
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera size={20} style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
        <label
          className="px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer"
          style={{ borderColor: 'var(--border)' }}
        >
          {uploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={uploading} />
        </label>

        {profile.verified && (
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ml-auto"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
            title="Verified by Estanza"
          >
            <BadgeCheck size={13} /> Verified
          </span>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Display name
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Agency name (optional)
        </label>
        <input
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="e.g. Sharma Realty"
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Short bio (optional, shown on your public catalog)
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 240))}
          placeholder="e.g. 8 years helping families find homes in South Delhi."
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{bio.length}/240</p>
      </div>

      <div className="mb-4">
        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
          WhatsApp number (with country code, no + or spaces)
        </label>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="919876543210"
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          This is the number your "Share on WhatsApp" buttons message.
        </p>
      </div>

      {error && <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm"
        style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c', opacity: saving ? 0.6 : 1 }}
      >
        {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
      </button>
    </Card>
  );
}

function SubscriptionSection({ profile }) {
  const planLabel = profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free';

  let daysLeft = null;
  if (profile.plan_expires_at) {
    const diffMs = new Date(profile.plan_expires_at).getTime() - Date.now();
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  return (
    <Card title="Subscription">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold mb-1">{planLabel} plan</p>
          {profile.plan_expires_at ? (
            <p className="text-xs" style={{ color: daysLeft <= 3 ? '#ef4444' : 'var(--text-muted)' }}>
              {daysLeft > 0 ? `Renews / expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` : 'Your plan has expired'}
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {profile.plan === 'free' || !profile.plan ? 'No expiry on the free plan' : 'No expiry date set'}
            </p>
          )}
        </div>
        <a
          href="/pricing"
          className="px-4 py-2 rounded-lg text-sm font-semibold border"
          style={{ borderColor: 'var(--border)' }}
        >
          {profile.plan === 'free' || !profile.plan ? 'Upgrade plan' : 'Manage plan'}
        </a>
      </div>
    </Card>
  );
}

function FeedbackSection({ profile }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const { error: insErr } = await supabase
        .from('feedback')
        .insert({ broker_id: profile.id, message: message.trim() });
      if (insErr) throw insErr;
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err.message || 'Could not send feedback.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card title="Feedback">
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        Something broken, or a feature you wish Estanza had? Tell us directly.
      </p>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your feedback here…"
        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none mb-3"
        style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
      {error && <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending || !message.trim()}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm border"
        style={{ borderColor: 'var(--border)', opacity: sending || !message.trim() ? 0.5 : 1 }}
      >
        {sent ? <><Check size={14} /> Sent — thank you</> : <><Send size={14} /> {sending ? 'Sending…' : 'Send feedback'}</>}
      </button>
    </Card>
  );
}

function DangerZone({ signOut, navigate }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      const { error: rpcErr } = await supabase.rpc('delete_own_account');
      if (rpcErr) throw rpcErr;
      await signOut();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not delete account. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl p-5 border" style={{ borderColor: '#ef4444', background: 'var(--surface)' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3 flex items-center gap-1.5" style={{ color: '#ef4444' }}>
        <AlertTriangle size={13} /> Danger zone
      </p>

      {!confirming ? (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Deleting your account permanently removes your profile, all your properties, and your
            public catalog link. This cannot be undone.
          </p>
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            <Trash2 size={14} /> Delete my account
          </button>
        </>
      ) : (
        <>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Type <span className="font-semibold" style={{ color: 'var(--text)' }}>DELETE</span> to confirm. This is permanent.
          </p>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none mb-3"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          {error && <p className="text-sm mb-3" style={{ color: '#ef4444' }}>{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={typed !== 'DELETE' || deleting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm"
              style={{ background: '#ef4444', color: '#fff', opacity: typed !== 'DELETE' || deleting ? 0.5 : 1 }}
            >
              <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              onClick={() => { setConfirming(false); setTyped(''); setError(''); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: 'var(--border)' }}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
