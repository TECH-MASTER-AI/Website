import data from '../init/data.js';

const missing = [
  'lfu-cache-implementation',
  'all-oone-data-structure', 
  'insert-delete-getrandom-o1',
  'insert-delete-getrandom-duplicates',
  'design-twitter-feed',
  'design-snake-game',
  'design-tic-tac-toe',
  'design-hit-counter',
  'design-phone-directory',
  'design-log-storage-system',
  'design-in-memory-file-system',
  'design-search-autocomplete-system',
  'design-add-search-words',
  'design-compressed-string-iterator',
  'design-bounded-blocking-queue',
  'design-underground-system',
  'design-parking-system',
  'design-browser-history'
];

console.log('Checking for duplicate slugs in data.js:\n');

data.forEach((p, i) => {
  if (missing.includes(p.slug)) {
    console.log(`${p.slug}: ID ${p.id}, Array Index ${i}`);
  }
});
