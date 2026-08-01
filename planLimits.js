// Central place for "how many properties can this broker have active right now".
//
// A broker's paid plan can lapse (autopay cancelled, billing period ended) —
// when that happens we don't delete anything. We just fall back to the free
// limit and put the newest properties "on hold" until they pay again. The
// moment n8n marks the plan active again (via the Paddle webhook), everything
// unlocks automatically because this is computed live, not stored.

export function getPropertyLimit(profile) {
  if (!profile) return 1;
  const now = Date.now();
  const expired = profile.plan_expires_at && new Date(profile.plan_expires_at).getTime() < now;
  const effectivePlan = expired ? 'free' : profile.plan || 'free';
  if (effectivePlan === 'unlimited') return Infinity;
  if (effectivePlan === 'growth') return 50;
  return 1;
}

// Oldest properties stay active up to the limit; anything added after the
// limit was reached goes "on hold" — matches "the one you just added is the
// one we keep off until you upgrade".
export function splitActiveHeld(properties, limit) {
  const sorted = [...properties].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  if (limit === Infinity) {
    return { active: sorted, held: [] };
  }
  return {
    active: sorted.slice(0, limit),
    held: sorted.slice(limit),
  };
}
