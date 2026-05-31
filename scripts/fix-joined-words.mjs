#!/usr/bin/env node
// PDF 추출 시 italic 텍스트가 공백 없이 합쳐진 케이스를 정리.
// meaningEn 필드 안의 문자열만 대상으로, 자주 보이는 패턴을 일괄 치환.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// 합법 단어와 충돌하지 않게 specific pair 만 나열
const JOINS = [
  // X + of
  ["periodof", "period of"],
  ["actof", "act of"],
  ["partof", "part of"],
  ["pointof", "point of"],
  ["insightof", "insight of"],
  ["insightor", "insight or"],
  ["powerof", "power of"],
  ["wayof", "way of"],
  ["areaof", "area of"],
  ["bodyof", "body of"],
  ["fearof", "fear of"],
  ["sortof", "sort of"],
  ["loveof", "love of"],
  ["headof", "head of"],
  ["formof", "form of"],
  ["lossof", "loss of"],
  ["typeof", "type of"],
  ["topof", "top of"],
  ["styleof", "style of"],
  ["lackof", "lack of"],
  ["showof", "show of"],
  ["senseof", "sense of"],
  ["periodor", "period or"],
  // X + on
  ["basedon", "based on"],
  ["notin", "not in"],
  ["putin", "put in"],
  // X + to
  ["hardto", "hard to"],
  ["usedto", "used to"],
  ["rightto", "right to"],
  ["liketo", "like to"],
  ["needto", "need to"],
  ["abilityto", "ability to"],
  ["tendto", "tend to"],
  ["intoa", "into a"],
  ["into a", "into a"],
  // X + by
  ["markedby", "marked by"],
  ["ledby", "led by"],
  // X + or
  ["voidor", "void or"],
  ["supportor", "support or"],
  ["mindor", "mind or"],
  ["boldor", "bold or"],
  ["andor", "and or"],
  ["loveor", "love or"],
  ["thinkor", "think or"],
  ["positor", "posit or"],
  ["lackor", "lack or"],
  ["actor", "actor"], // legitimate — but if context wrong, no harm
  ["acidor", "acid or"],
  ["plantor", "plant or"],
  ["wordor", "word or"],
  ["bookor", "book or"],
  ["bador", "bad or"],
  ["birdof", "bird of"],
  ["birdor", "bird or"],
  ["partsor", "parts or"],
  ["areaor", "area or"],
  ["amountor", "amount or"],
  // X + off
  ["castoff", "cast off"],
  ["cuttingoff", "cutting off"],
  // misc
  ["regardwith", "regard with"],
  ["abreastof", "abreast of"],
  ["throughoutwhile", "throughout while"],
  ["Departsuddenly", "Depart suddenly"],
  ["andsecretively", "and secretively"],
  ["Holdback", "Hold back"],
  ["andvastspace", "and vast space"],
  ["profoundor", "profound or"],
  ["addedpartor", "added part or"],
  ["andtaste", "and taste"],
  ["andplace", "and place"],
  ["andfriendly", "and friendly"],
  ["adoptedto", "adopted to"],
  ["amountto", "amount to"],
  ["builton", "built on"],
  ["nestof", "nest of"],
  ["whatis", "what is"],
  ["andinfinite", "and infinite"],
  ["andvast", "and vast"],
  ["appliedto", "applied to"],
  ["convertedto", "converted to"],
  ["wordor", "word or"],
  ["phraseor", "phrase or"],
  ["thatis", "that is"],
  ["thatof", "that of"],
  ["onthe", "on the"],
  ["isnot", "is not"],
  ["didnot", "did not"],
  ["donot", "do not"],
  ["asin", "as in"],
  ["forthe", "for the"],
  ["andthe", "and the"],
  ["orthe", "or the"],
  ["whocan", "who can"],
  ["soonor", "soon or"],
  ["givento", "given to"],
  ["broughtto", "brought to"],
  ["donatedto", "donated to"],
  ["resistantto", "resistant to"],
  ["addedto", "added to"],
  ["expectedto", "expected to"],
  ["forcedto", "forced to"],
  ["preparedto", "prepared to"],
  ["pertainsto", "pertains to"],
  ["bothalike", "both alike"],
  ["allwith", "all with"],
  ["withand", "with and"],
  // 2차 라운드 — 데이터 빈도 분석으로 추가
  ["attemptto", "attempt to"],
  ["concernedwith", "concerned with"],
  ["relatedto", "related to"],
  ["resultof", "result of"],
  ["whatto", "what to"],
  ["devotedto", "devoted to"],
  ["composedof", "composed of"],
  ["characterizedby", "characterized by"],
  ["shutoff", "shut off"],
  ["causedby", "caused by"],
  ["shapedor", "shaped or"],
  ["motivatedby", "motivated by"],
  ["remindto", "remind to"],
  ["eventto", "event to"],
  ["empoweredto", "empowered to"],
  ["understoodby", "understood by"],
  ["withoutthe", "without the"],
  ["deceitor", "deceit or"],
  ["abstinentor", "abstinent or"],
  ["proceedor", "proceed or"],
  ["crowdin", "crowd in"],
  ["peasantor", "peasant or"],
  ["intendedto", "intended to"],
  ["liquidto", "liquid to"],
  ["solidor", "solid or"],
  ["listor", "list or"],
  ["aboutwhatto", "about what to"],
  ["aboutor", "about or"],
  ["againstthe", "against the"],
  ["amountof", "amount of"],
  ["anddiscover", "and discover"],
  ["anddissension", "and dissension"],
  ["andthin", "and thin"],
  ["artand", "art and"],
  ["artexhibitof", "art exhibit of"],
  ["athand", "at hand"],
  ["authorizedto", "authorized to"],
  ["backgroundor", "background or"],
  ["badbehavior", "bad behavior"],
  ["beyondthat", "beyond that"],
  ["brilliantor", "brilliant or"],
  ["burdenedby", "burdened by"],
  ["caredfor", "cared for"],
  ["carriedoff", "carried off"],
  ["classifyas", "classify as"],
  ["confinedto", "confined to"],
  ["contextto", "context to"],
  ["contrastor", "contrast or"],
  ["controlledor", "controlled or"],
  ["convolutedor", "convoluted or"],
  ["deadin", "dead in"],
  ["decidedby", "decided by"],
  ["donatedto", "donated to"],
  ["forcedto", "forced to"],
  ["givento", "given to"],
  ["preparedto", "prepared to"],
  ["resistantto", "resistant to"],
  ["broughtto", "brought to"],
  ["formedfrom", "formed from"],
  ["agreementor", "agreement or"],
  ["areawithin", "area within"],
  ["effortor", "effort or"],
  ["effortto", "effort to"],
  ["ofwhat", "of what"],
  ["ofan", "of an"],
  ["asto", "as to"],
  ["nottrue", "not true"],
  ["notwilling", "not willing"],
  ["notonly", "not only"],
  ["beto", "be to"],
  ["abilityof", "ability of"],
  ["ableto", "able to"],
  ["allowedto", "allowed to"],
  ["addressedto", "addressed to"],
  ["adjectiveof", "adjective of"],
  ["affixedto", "affixed to"],
  ["agreedto", "agreed to"],
];

const dataDir = path.join(repoRoot, "src/data");
const files = fs.readdirSync(dataDir).filter((f) => /^words-\d+\.ts$/.test(f)).sort();

let totalFixes = 0;
const fileFixes = {};

for (const file of files) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // meaningEn 의 값 부분에서만 치환
  let fixCount = 0;
  content = content.replace(/(meaningEn:\s*")([^"]*)(")/g, (match, pre, def, post) => {
    let fixed = def;
    for (const [from, to] of JOINS) {
      // word boundary 로 보호. "actor" 같은 합법 단어가 들어있지만 from===to 인 경우 변화 없음.
      const re = new RegExp(`\\b${from}\\b`, "g");
      const before = fixed;
      fixed = fixed.replace(re, to);
      if (fixed !== before) fixCount += (before.match(re) || []).length;
    }
    return pre + fixed + post;
  });

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content);
    fileFixes[file] = fixCount;
    totalFixes += fixCount;
  }
}

console.log("Joined-word fixes:");
for (const [f, n] of Object.entries(fileFixes)) console.log(`  ${f}: ${n}`);
console.log(`Total: ${totalFixes}`);
