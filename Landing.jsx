import React from 'react';
import { Link } from 'react-router-dom';
import {
  Link2, MessageCircle, Image as ImageIcon, Globe, MapPin, Heart,
  ShieldCheck, ArrowRight,
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Link2,
      title: 'One branded link',
      desc: 'Every listing lives at a clean, professional URL — not a blurry WhatsApp forward.',
    },
    {
      icon: ImageIcon,
      title: 'Photo + video galleries',
      desc: 'Up to 30 images and a walkthrough video per property, in a proper carousel.',
    },
    {
      icon: MessageCircle,
      title: 'One-tap WhatsApp',
      desc: 'Every card and detail page has a WhatsApp button pre-filled with the property, so leads reach you instantly.',
    },
    {
      icon: Globe,
      title: 'Multi-currency pricing',
      desc: 'Show INR, USD, GBP, EUR or AED per property — set once in your dashboard.',
    },
    {
      icon: MapPin,
      title: 'Nearby facilities',
      desc: 'Add schools, metro stations, hospitals with distance — auto-tagged and color-coded.',
    },
    {
      icon: Heart,
      title: 'Save & compare',
      desc: 'Leads can save properties they like and revisit them later — no account needed.',
    },
  ];

  const steps = [
    ['01', 'Add your properties', 'Upload photos, video, price, and nearby facilities from your dashboard.'],
    ['02', 'Share one link', 'Send your branded catalog link on WhatsApp instead of a folder of photos.'],
    ['03', 'Leads message you', 'They browse, save what they like, and tap straight through to WhatsApp.'],
  ];

  return (
    <div>
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
          Built for real estate brokers, worldwide
        </p>
        <h1 className="font-display font-semibold leading-tight mb-5" style={{ fontSize: 'clamp(36px,6vw,60px)' }}>
          Stop forwarding blurry photos on WhatsApp.
          <br />
          <span style={{ color: 'var(--text-muted)' }}>Send a link instead.</span>
        </h1>
        <p className="text-lg max-w-xl mb-9 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Estanza turns your listings into a premium, shareable catalog. Leads browse, watch,
          and message you directly on WhatsApp — no login required for them.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/auth" className="px-6 py-3 rounded-lg font-semibold"
            style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}>
            Get started free
          </Link>
          <Link to="/pricing" className="px-6 py-3 rounded-lg border"
            style={{ borderColor: 'var(--border)' }}>
            View pricing
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          How it works
        </p>
        <h2 className="font-display text-3xl mb-10">From raw photos to a client-ready link in minutes.</h2>
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
          {steps.map(([n, t, d]) => (
            <div key={n}>
              <p className="font-display text-4xl mb-3" style={{ color: 'var(--text-muted)' }}>{n}</p>
              <p className="font-semibold mb-1.5">{t}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          Everything in one catalog
        </p>
        <h2 className="font-display text-3xl mb-10">Built to make you look established.</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Icon size={20} style={{ color: 'var(--text-muted)' }} className="mb-3" />
              <p className="font-semibold text-sm mb-2">{title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust section — honest, no fake testimonials */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="rounded-2xl p-8 md:p-10 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <ShieldCheck size={24} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <h2 className="font-display text-2xl md:text-3xl mb-4 max-w-2xl">
            Why a proper catalog builds more trust than a photo dump.
          </h2>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            A raw WhatsApp forward looks like anyone could have sent it. A branded Estanza link with
            organized photos, video, verified pricing, and nearby facilities signals that a serious,
            established broker is behind the listing — before the lead has even messaged you.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>🇮🇳 India</span>
            <span>🇺🇸 USA</span>
            <span>🇬🇧 UK</span>
            <span>🇦🇪 UAE</span>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center border-t" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-3xl md:text-4xl mb-5">Ready to send your first link?</h2>
        <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
          Free to start. No credit card required.
        </p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}>
          Get started free <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
