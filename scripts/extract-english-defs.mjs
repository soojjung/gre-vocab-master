#!/usr/bin/env node
// Manhattan Prep / Target Test Prep PDF raw 추출본에서 영어 정의 파싱 후
// src/data/words-*.ts 의 각 entry 에 meaningEn 필드를 삽입한다.
//
// 사전 준비:
//   pdftotext -raw src/data/manhattan_prep_1000_gre_words_.pdf /tmp/manhattan_raw.txt
//   pdftotext -raw src/data/target_test_prep_gre_vocabulary.pdf /tmp/ttp_raw.txt
//
// 실행:
//   node scripts/extract-english-defs.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// ---- PDF raw 파싱 ----

function parseEntries(text) {
  // 페이지 구분자(form feed) 등 비공백 보이지 않는 문자를 공백/줄바꿈으로 정규화
  text = text.replace(/\f/g, "\n");
  // PDF 추출 시 줄바꿈이 누락된 케이스 보정: 글자 직후에 "N. word" 패턴이 붙어 있으면
  // 직전 정의가 다음 항목과 합쳐진 것이므로 강제 줄바꿈 삽입.
  // (예: "...ineffective609. neologism..." → "...ineffective\n609. neologism...")
  text = text.replace(/([a-z\)\]'])(\d+)\.\s+([a-z][a-zA-Z'-]*)\s/g, "$1\n$2. $3 ");

  // 공통 헤더 제거
  const cleaned = text
    .split("\n")
    .filter((l) => !/^Manhattan Prep 1000 GRE Words/.test(l))
    .filter((l) => !/^Study online at/.test(l))
    .filter((l) => !/^WORD PART OF SPEECH DEFINITION/.test(l))
    .filter((l) => !/^GRE® Vocab Review Sheet/.test(l))
    .join("\n");

  const entries = {};
  let current = null;
  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^(\d+)\.\s+([a-zA-Z][a-zA-Z'-]*)\s+(.*)$/);
    if (m) {
      if (current) push(entries, current);
      current = { word: m[2], def: m[3] };
    } else if (current) {
      current.def += " " + line;
    }
  }
  if (current) push(entries, current);
  return entries;
}

function push(entries, current) {
  const key = current.word.toLowerCase();
  // 첫 항목 우선(같은 단어가 여러 번 나오면 첫 정의 유지)
  if (!entries[key]) entries[key] = cleanDef(current.def);
}

function cleanDef(def) {
  return def
    .replace(/\s+/g, " ")
    .trim()
    // PDF 추출 시 합쳐진 단어 일부 — 자주 보이는 패턴만 처리
    .replace(/\bregardwith\b/g, "regard with")
    .replace(/\babreastof\b/g, "abreast of")
    .replace(/\bthroughoutwhile\b/g, "throughout while")
    .replace(/\bplantor\b/g, "plant or")
    .replace(/\bDepartsuddenly\b/g, "Depart suddenly")
    .replace(/\bandsecretively\b/g, "and secretively")
    .replace(/\bHoldback\b/g, "Hold back")
    .replace(/\bbador\b/g, "bad or")
    .replace(/\bandvastspace\b/g, "and vast space")
    .replace(/\bprofoundor\b/g, "profound or")
    .replace(/\baddedpartor\b/g, "added part or")
    .replace(/\bacidor\b/g, "acid or")
    .replace(/\bandtaste\b/g, "and taste")
    .replace(/\bandplace\b/g, "and place")
    .replace(/\bandfriendly\b/g, "and friendly")
    .replace(/\badoptedto\b/g, "adopted to")
    .replace(/\bamountto\b/g, "amount to")
    .replace(/\bbuilton\b/g, "built on")
    .replace(/\bnestof\b/g, "nest of")
    .replace(/\bbirdof\b/g, "bird of")
    .replace(/\bwhatis\b/g, "what is")
    .replace(/\bandinfinite\b/g, "and infinite")
    .replace(/\bandvast\b/g, "and vast");
}

const manhattan = parseEntries(fs.readFileSync("/tmp/manhattan_raw.txt", "utf8"));
const ttp = parseEntries(fs.readFileSync("/tmp/ttp_raw.txt", "utf8"));

// Manhattan 우선(GRE 특화로 더 정확), 없으면 TTP fallback
const lookup = { ...ttp, ...manhattan };

console.log(`Parsed: Manhattan=${Object.keys(manhattan).length}, TTP=${Object.keys(ttp).length}, Combined=${Object.keys(lookup).length}`);

// ---- words-*.ts 갱신 ----

const dataDir = path.join(repoRoot, "src/data");
const files = fs
  .readdirSync(dataDir)
  .filter((f) => /^words-\d+\.ts$/.test(f))
  .sort();

let total = 0;
let matched = 0;
const missing = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  content = content.replace(
    /\{\s*id:\s*(\d+),\s*word:\s*"([^"]+)",\s*meaning:\s*"([^"]+)",\s*/g,
    (match, id, word, meaning) => {
      total++;
      // 이미 meaningEn 이 들어가 있으면 건드리지 않음
      // (정규식이 match 한 직후 텍스트가 meaningEn 으로 시작하는지는 호출부에서 가드)
      const def = lookup[word.toLowerCase()];
      if (def) {
        matched++;
        const escaped = def.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `{ id: ${id}, word: "${word}", meaning: "${meaning}", meaningEn: "${escaped}", `;
      }
      missing.push({ id: Number(id), word, file });
      return match;
    }
  );

  fs.writeFileSync(filePath, content);
}

console.log(`Total entries: ${total}, Matched: ${matched}, Missing: ${missing.length}`);

if (missing.length > 0) {
  console.log("\nFirst 30 missing words:");
  for (const m of missing.slice(0, 30)) console.log(`  ${m.id} ${m.word} (${m.file})`);

  // 누락 단어 목록을 별도 파일로 저장 — LLM 보강용
  fs.writeFileSync(
    path.join(repoRoot, "scripts/missing-english-defs.json"),
    JSON.stringify(missing, null, 2)
  );
  console.log(`\nMissing 목록 저장: scripts/missing-english-defs.json (${missing.length} 단어)`);
}
