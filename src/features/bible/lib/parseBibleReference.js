// Robust helpers to parse Bible references (e.g., "1. Joh 5:7", "Johannes 3,16", "Johannes 3 16", "Joh 3")
const parseBibleReference = (query) => {
  if (!query) return null;
  const clean = query.trim();
  // Match: (Optional Book number with space/dot) (Book name letters/dots) (whitespace) (Chapter number) (optional separators and verse number)
  // Matches "1. Joh 3:16", "1.Joh 3,16", "Johannes 3 16", "Joh 3"
  const match = clean.match(
    /^([1-3]?\s*\.?\s*[a-zA-Z\u00C0-\u00FF]+(?:\s*[a-zA-Z\u00C0-\u00FF]+)*)\s+(\d+)(?:[\s:,v\.\-]+(\d+))?/i,
  );
  if (!match) return null;

  return {
    bookStr: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verse: match[3] ? parseInt(match[3], 10) : null,
  };
};

export { parseBibleReference };
