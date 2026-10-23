import { BIBLE_BOOKS } from "./BIBLE_BOOKS";

const findBibleBook = (bookStr) => {
  if (!bookStr) return null;
  const cleanStr = bookStr.toLowerCase().replace(/[\.\s]/g, ""); // "1.joh" -> "1joh", "joh" -> "joh"

  // 1. Exact match (ignoring dots and spaces)
  let found = BIBLE_BOOKS.find(
    (b) =>
      b.nor.toLowerCase().replace(/[\.\s]/g, "") === cleanStr ||
      b.eng.toLowerCase().replace(/[\.\s]/g, "") === cleanStr ||
      b.id.toLowerCase() === cleanStr,
  );
  if (found) return found;

  // 2. Prefix match
  found = BIBLE_BOOKS.find(
    (b) =>
      b.nor
        .toLowerCase()
        .replace(/[\.\s]/g, "")
        .startsWith(cleanStr) ||
      b.eng
        .toLowerCase()
        .replace(/[\.\s]/g, "")
        .startsWith(cleanStr),
  );
  if (found) return found;

  // 3. Contains match
  found = BIBLE_BOOKS.find(
    (b) =>
      b.nor
        .toLowerCase()
        .replace(/[\.\s]/g, "")
        .includes(cleanStr) ||
      b.eng
        .toLowerCase()
        .replace(/[\.\s]/g, "")
        .includes(cleanStr),
  );
  return found;
};

export { findBibleBook };
