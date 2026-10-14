let profanityList: string[] = ['비속어1', '욕설1', '스팸1', '바보', '멍청이'];

export function setProfanityList(words: string[]): void {
  profanityList = words.map((w) => w.trim().toLowerCase()).filter(Boolean);
}

export function getProfanityList(): string[] {
  return [...profanityList];
}

export function filterProfanity(text: string): { cleanText: string; hasProfanity: boolean } {
  let cleanText = text;
  let hasProfanity = false;

  for (const badWord of profanityList) {
    if (!badWord) continue;
    const regex = new RegExp(badWord, 'gi');
    if (regex.test(cleanText)) {
      hasProfanity = true;
      cleanText = cleanText.replace(regex, '*'.repeat(badWord.length));
    }
  }

  return { cleanText, hasProfanity };
}
