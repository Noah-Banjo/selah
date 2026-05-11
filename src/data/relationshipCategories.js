const FAMILY = new Set([
  'father', 'mother', 'son', 'daughter',
  'brother', 'sister', 'half-brother', 'half-sister',
  'husband', 'wife',
  'grandfather', 'grandmother', 'grandson', 'granddaughter',
  'ancestor', 'descendant', 'relative',
  'mother-in-law', 'daughter-in-law', 'father-in-law', 'son-in-law', 'sister-in-law', 'brother-in-law',
]);

const FRIENDSHIP = new Set(['friend', 'companion', 'ally']);
const DISCIPLESHIP = new Set(['mentor', 'disciple', 'teacher', 'student', 'predecessor', 'successor']);
const RIVALRY = new Set(['enemy', 'rival', 'betrayer', 'persecutor']);

export const CATEGORY_COLORS = {
  family: '#C9A84C',
  friendship: '#5A8CD8',
  discipleship: '#5AB880',
  rivalry: '#D86060',
};

export const CATEGORY_LABELS = {
  family: 'Family',
  friendship: 'Friendship',
  discipleship: 'Discipleship',
  rivalry: 'Rivalry',
};

const PRIORITY = ['family', 'rivalry', 'discipleship', 'friendship'];

export function categorize(type) {
  if (!type) return 'family';
  const t = type.toLowerCase().trim();
  if (FAMILY.has(t)) return 'family';
  if (FRIENDSHIP.has(t)) return 'friendship';
  if (DISCIPLESHIP.has(t)) return 'discipleship';
  if (RIVALRY.has(t)) return 'rivalry';
  return 'family';
}

export function resolveCategory(typeA, typeB) {
  const a = categorize(typeA);
  if (!typeB) return a;
  const b = categorize(typeB);
  if (a === b) return a;
  return PRIORITY.indexOf(a) <= PRIORITY.indexOf(b) ? a : b;
}
