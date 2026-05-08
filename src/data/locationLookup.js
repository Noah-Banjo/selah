import locations from './locations.json';

const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[(),]/g, '')
    .replace(/^the\s+/, '')
    .trim();

export function findLocationByLabel(label) {
  if (!label) return null;
  const norm = normalize(label);
  let exact = null;
  let partial = null;
  for (const loc of locations) {
    const lname = normalize(loc.name);
    if (lname === norm) {
      exact = loc;
      break;
    }
    if (!partial && (lname.includes(norm) || norm.includes(lname))) {
      partial = loc;
    }
  }
  return exact || partial;
}
