let profanityList: string[] = ['비속어1', '욕설1', '스팸1', '바보', '멍청이'];

interface CompiledRule {
  regex: RegExp;
  replacement: string;
}

let compiledRules: CompiledRule[] = [];

function recompileRules(): void {
  compiledRules = profanityList
    .filter(Boolean)
    .map((word) => ({
      regex: new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      replacement: '*'.repeat(word.length),
    }));
}

// Initial compile
recompileRules();

export function setProfanityList(words: string[]): void {
  profanityList = words.map((w) => w.trim().toLowerCase()).filter(Boolean);
  recompileRules();
}

export function getProfanityList(): string[] {
  return [...profanityList];
}

export function filterProfanity(text: string): { cleanText: string; hasProfanity: boolean } {
  let cleanText = text;
  let hasProfanity = false;

  for (let i = 0; i < compiledRules.length; i++) {
    const rule = compiledRules[i];
    rule.regex.lastIndex = 0;
    if (rule.regex.test(cleanText)) {
      hasProfanity = true;
      rule.regex.lastIndex = 0;
      cleanText = cleanText.replace(rule.regex, rule.replacement);
    }
  }

  return { cleanText, hasProfanity };
}
