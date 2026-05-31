#!/usr/bin/env node
// extract-english-defs.mjs 실행 후 남은 누락 단어들에 대해 손으로 작성한
// 정의를 머지한다. 같은 단어가 이미 meaningEn 을 가지고 있으면 덮어쓰지 않음.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const manual = JSON.parse(fs.readFileSync(path.join(__dirname, "manual-english-defs.json"), "utf8"));

const dataDir = path.join(repoRoot, "src/data");
const files = fs
  .readdirSync(dataDir)
  .filter((f) => /^words-\d+\.ts$/.test(f))
  .sort();

let total = 0;
let updated = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // 이미 meaningEn 이 없는 entry 만 매칭: meaning: "X", 직후가 example 으로 시작
  content = content.replace(
    /\{\s*id:\s*(\d+),\s*word:\s*"([^"]+)",\s*meaning:\s*"([^"]+)",\s*example:/g,
    (match, id, word, meaning) => {
      total++;
      const def = manual[word];
      if (def) {
        updated++;
        const escaped = def.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `{ id: ${id}, word: "${word}", meaning: "${meaning}", meaningEn: "${escaped}", example:`;
      }
      return match;
    }
  );

  fs.writeFileSync(filePath, content);
}

console.log(`Without meaningEn (before): ${total}, Filled from manual: ${updated}`);

// 검증: 여전히 meaningEn 이 없는 entry 가 있는지
let stillMissing = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(dataDir, file), "utf8");
  const matches = content.match(/\{\s*id:\s*\d+,\s*word:\s*"([^"]+)",\s*meaning:\s*"[^"]+",\s*example:/g);
  if (matches) {
    for (const m of matches) {
      stillMissing++;
      const w = m.match(/word:\s*"([^"]+)"/)[1];
      console.log(`  still missing: ${w} (${file})`);
    }
  }
}
console.log(`Still missing after manual merge: ${stillMissing}`);
