import { useCallback, useState } from 'react';

const KEY_PREFIX = 'selah:note:';

const readNote = (id) => {
  try {
    return localStorage.getItem(KEY_PREFIX + id) ?? '';
  } catch {
    return '';
  }
};

const writeNote = (id, text) => {
  try {
    if (text) {
      localStorage.setItem(KEY_PREFIX + id, text);
    } else {
      localStorage.removeItem(KEY_PREFIX + id);
    }
  } catch {}
};

export function useNote(id) {
  const [text, setText] = useState(() => readNote(id));

  const update = useCallback(
    (value) => {
      setText(value);
      writeNote(id, value);
    },
    [id]
  );

  return { text, update };
}
