const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildBlankRegex = (word: string): RegExp => {
  const escaped = escapeRegex(word);
  const variants = [
    escaped + "(?:s|es|ed|ing|d|er|est|ly|ier|iest|ation|al|ally|ically)?",
  ];

  if (word.endsWith("y")) {
    variants.push(escapeRegex(word.slice(0, -1)) + "i(?:ed|es|er|est)");
  }

  if (word.endsWith("e")) {
    variants.push(
      escapeRegex(word.slice(0, -1)) +
        "(?:ing|ed|es|er|est|ation|able|ible|ical|ally)",
    );
  }

  const last = word[word.length - 1];
  if (word.length >= 2 && /[bcdfghjklmnpqrstvwxz]/i.test(last)) {
    variants.push(escaped + escapeRegex(last) + "(?:ed|ing|er|est)");
  }

  return new RegExp(`\\b(?:${variants.join("|")})\\b`, "gi");
};

export const getBlankSentence = (example: string, word: string): string => {
  return example.replace(buildBlankRegex(word), "_____");
};
