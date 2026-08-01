import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Heart, Search, X, BadgeCheck, User } from 'lucide-react';
import { supabase } from './supabaseClient';
import { formatPrice } from './pricing';
import { isSaved, toggleSaved } from './savedProperties';
import { getPropertyLimit, splitActiveHeld } from './planLimits';

export default function Catalog() {
  const { brokerId } = useParams();
  const [broker, setBroker] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      const { data: b } = await supabase.from('broker_profiles').select('*').eq('id', brokerId).single();
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('broker_id', brokerId)
        .order('created_at', { ascending: false });
      setBroker(b);
      setProperties(props || []);
      setLoading(false);
    }
    load();
  }, [brokerId]);

  // Properties beyond the broker's current plan limit are "on hold" and
  // should never be visible on the public catalog.
  const visibleProperties = useMemo(() => {
    if (!broker) return [];
    const limit = getPropertyLimit(broker);
    const { active } = splitActiveHeld(properties, limit);
    const activeIds = new Set(active.map((p) => p.id));
    // Preserve the original newest-first display order.
    return properties.filter((p) => activeIds.has(p.id));
  }, [properties, broker]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleProperties;
    return visibleProperties.filter((p) =>
      (p.location || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q)
    );
  }, [visibleProperties, query]);

  if (loading) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading catalog…</div>;
  if (!broker) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>This catalog link doesn't exist.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-9">
      <BrokerHeader broker={broker} />

      {visibleProperties.length > 0 && (
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by location or property name…"
            className="w-full pl-9 pr-9 py-3 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {visibleProperties.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No properties listed yet.</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No properties match "{query}". Try a different location.</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} broker={broker} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrokerHeader({ broker }) {
  return (
    <div className="flex items-start gap-4 mb-7">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {broker.photo_url ? (
          <img src={broker.photo_url} alt={broker.display_name} className="w-full h-full object-cover" />
        ) : (
          <User size={22} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <h2 className="font-display text-2xl">{broker.agency_name || broker.display_name}</h2>
          {broker.verified && (
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
              title="Verified by Estanza"
            >
              <BadgeCheck size={12} /> Verified
            </span>
          )}
        </div>
        {broker.agency_name && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{broker.display_name}</p>
        )}
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No login needed to browse</p>
        {broker.bio && (
          <p className="text-sm mt-2 max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>{broker.bio}</p>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property, broker }) {
  const [saved, setSaved] = useState(isSaved(property.id));

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="relative">
        <img src={property.images?.[0]} alt={property.title} className="w-full h-36 object-cover" />
        <button
          onClick={() => setSaved(toggleSaved(property.id))}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          title={saved ? 'Remove from saved' : 'Save this property'}
        >
          <Heart size={15} color={saved ? '#ef4444' : '#fff'} fill={saved ? '#ef4444' : 'none'} />
        </button>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-semibold">{property.title}</p>
        <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} className="inline -mt-0.5 mr-1" />
          {property.location} · {formatPrice(property.price, property.currency)}
        </p>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${broker.whatsapp_number || ''}?text=${encodeURIComponent('Hi, I am interested in ' + property.title)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-lg"
            style={{ background: '#25D366', color: '#fff' }}
          >
            WhatsApp
          </a>
          <Link
            to={`/property/${property.id}`}
            className="flex-1 text-center text-xs py-2 rounded-lg border"
            style={{ borderColor: 'var(--border)' }}
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
