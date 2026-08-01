// Converts a 0-100 slider position to a real distance in meters,
// using a logarithmic scale so the same slider can smoothly cover
// everything from 50m up to 100km (a linear scale would make short
// distances impossible to select precisely).
const MIN_M = 50;
const MAX_M = 100000; // 100km

export function sliderToMeters(sliderValue) {
  const t = sliderValue / 100;
  const logMin = Math.log(MIN_M);
  const logMax = Math.log(MAX_M);
  return Math.round(Math.exp(logMin + t * (logMax - logMin)));
}

export function metersToSlider(meters) {
  const logMin = Math.log(MIN_M);
  const logMax = Math.log(MAX_M);
  const t = (Math.log(meters) - logMin) / (logMax - logMin);
  return Math.round(t * 100);
}

export function formatDistance(meters) {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)}km`;
}

// A tasteful, muted palette that auto-cycles per facility tag,
// so brokers never have to think about color choices themselves.
const PALETTE = ['#c9a876', '#8fa6b8', '#a3b899', '#b89ab8', '#c2a3a3', '#9ab0c2'];

export function colorForIndex(i) {
  return PALETTE[i % PALETTE.length];
}
