import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, MapPin, MessageCircle, Heart, X, PauseCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { formatPrice } from './pricing';
import { isSaved, toggleSaved } from './savedProperties';
import { getPropertyLimit, splitActiveHeld } from './planLimits';

const DESCRIPTION_PREVIEW_LENGTH = 180;

export default function Detail() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [broker, setBroker] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isHeld, setIsHeld] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('properties').select('*').eq('id', propertyId).single();
      if (p) {
        const { data: b } = await supabase.from('broker_profiles').select('*').eq('id', p.broker_id).single();
        const { data: allProps } = await supabase
          .from('properties')
          .select('*')
          .eq('broker_id', p.broker_id);

        if (b && allProps) {
          const limit = getPropertyLimit(b);
          const { held } = splitActiveHeld(allProps, limit);
          setIsHeld(held.some((h) => h.id === p.id));
        }

        const { data: sim } = await supabase
          .from('properties')
          .select('*')
          .eq('broker_id', p.broker_id)
          .neq('id', propertyId)
          .limit(3);
        setProperty(p);
        setBroker(b);
        setSimilar(sim || []);
        setSaved(isSaved(p.id));
      }
      setLoading(false);
      setIdx(0);
    }
    load();
  }, [propertyId]);

  if (loading) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  if (!property) return <div className="px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>Property not found.</div>;

  if (isHeld) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <PauseCircle size={28} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="font-display text-xl mb-2">This listing is temporarily unavailable</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Please check back later, or ask the broker for their latest catalog link.
        </p>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];
  const total = images.length;
  const description = property.description || '';
  const isLong = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const preview = isLong ? description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trim() + '…' : description;

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-4 px-2 py-1.5 rounded-lg border"
        style={{ borderColor: 'var(--border)' }}
      >
        <ChevronLeft size={15} /> Back
      </button>

      {total > 0 && (
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <img src={images[idx]} alt="" className="w-full h-80 object-cover block" />

          <button
            onClick={() => setSaved(toggleSaved(property.id))}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            title={saved ? 'Remove from saved' : 'Save this property'}
          >
            <Heart size={17} color={saved ? '#ef4444' : '#fff'} fill={saved ? '#ef4444' : 'none'} />
          </button>

          {total > 1 && (
            <>
              <button
                onClick={() => setIdx((idx - 1 + total) % total)}
                className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIdx((idx + 1) % total)}
                className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: i === idx ? 16 : 6,
                      height: 6,
                      background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl border mt-5 p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-display text-2xl mb-1.5">{property.title}</h2>
        <p className="text-sm mb-5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={13} /> {property.location}
        </p>

        <div className="mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-display font-semibold silver-text" style={{ fontSize: 'clamp(28px,5vw,38px)' }}>
            {formatPrice(property.price, property.currency)}
          </p>
        </div>

        {description && (
          <div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{preview}</p>
            {isLong && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full border"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
              >
                Show more <ChevronDown size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {property.facility_tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5 mb-6">
          {property.facility_tags.map((f, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: f.color, color: '#0a0a0c' }}
            >
              {f.name} · {f.meters < 1000 ? `${f.meters}m` : `${(f.meters / 1000).toFixed(1)}km`}
            </span>
          ))}
        </div>
      )}

      <a
        href={`https://wa.me/${broker?.whatsapp_number || ''}?text=${encodeURIComponent(
          `Hi, I'm interested in ${property.title} (${formatPrice(property.price, property.currency)})`
        )}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold mt-2 shadow-lg"
        style={{ background: '#25D366', color: '#fff' }}
      >
        <MessageCircle size={17} /> Message on WhatsApp
      </a>

      {similar.length > 0 && (
        <>
          <p className="font-display text-lg mt-9 mb-3">Not quite right? Explore nearby</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
            {similar.map((s) => (
              <SimilarCard key={s.id} property={s} />
            ))}
          </div>
        </>
      )}

      {showFullDescription && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowFullDescription(false)}
        >
          <div
            className="w-full sm:max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-xl">About this space</h3>
              <button
                onClick={() => setShowFullDescription(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{ borderColor: 'var(--border)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {description.split(/\n+/).filter((p) => p.trim()).map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SimilarCard({ property }) {
  const [saved, setSaved] = useState(isSaved(property.id));
  return (
    <div className="rounded-lg overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="relative">
        <img src={property.images?.[0]} alt="" className="w-full h-20 object-cover" />
        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved(toggleSaved(property.id));
          }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <Heart size={11} color={saved ? '#ef4444' : '#fff'} fill={saved ? '#ef4444' : 'none'} />
        </button>
      </div>
      <div className="p-2">
        <p className="text-xs font-semibold truncate">{property.title}</p>
        <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>
          {formatPrice(property.price, property.currency)}
        </p>
        <Link
          to={`/property/${property.id}`}
          className="block text-center text-[11px] py-1.5 rounded-lg border"
          style={{ borderColor: 'var(--border)' }}
        >
          View details
        </Link>
      </div>
    </div>
  );
}
