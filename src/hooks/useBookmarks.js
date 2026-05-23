import { useCallback, useState } from 'react';

const KEY = 'selah:bookmarks';

function readStorage() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) || []);
  } catch {
    return new Set();
  }
}

function writeStorage(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(readStorage);

  const toggle = useCallback((id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStorage(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id) => bookmarks.has(id), [bookmarks]);

  return { bookmarks, toggle, isBookmarked };
}
