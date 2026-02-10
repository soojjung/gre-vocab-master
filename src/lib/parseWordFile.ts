import type { FileParseResult } from "@/types";

/** CSV 필드 파싱 — 따옴표로 감싼 필드 내 쉼표 지원 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // 연속 따옴표는 이스케이프
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

/** 헤더에서 WORD, MEANING 컬럼 인덱스 자동 감지 */
function detectColumns(headerFields: string[]): { wordIdx: number; meaningIdx: number } | null {
  let wordIdx = -1;
  let meaningIdx = -1;
  for (let i = 0; i < headerFields.length; i++) {
    const f = headerFields[i].toLowerCase();
    if (f === "word" || f === "단어") wordIdx = i;
    if (f === "meaning" || f === "뜻") meaningIdx = i;
  }
  if (wordIdx >= 0 && meaningIdx >= 0) return { wordIdx, meaningIdx };
  return null;
}

/** CSV 파일 파싱 — 컬럼 위치 자동 감지, 빈 행 무시 */
function parseCSV(content: string): FileParseResult {
  const lines = content.split(/\r?\n/);
  const result: FileParseResult = { success: [], errors: [] };

  // 기본: word=0, meaning=1
  let wordIdx = 0;
  let meaningIdx = 1;
  let headerSkipped = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);

    // 첫 비어있지 않은 행에서 헤더 감지
    if (!headerSkipped && /word|meaning|단어|뜻/i.test(line)) {
      const detected = detectColumns(fields);
      if (detected) {
        wordIdx = detected.wordIdx;
        meaningIdx = detected.meaningIdx;
      }
      headerSkipped = true;
      continue;
    }

    // 빈 필드만 있는 행 무시
    const word = fields[wordIdx]?.trim();
    const meaning = fields[meaningIdx]?.trim();
    if (!word && !meaning) continue;

    if (word && meaning) {
      result.success.push({ word, meaning });
    } else {
      result.errors.push({ line: i + 1, content: line, reason: "word 또는 meaning이 비어있습니다" });
    }
  }

  return result;
}

/** TXT 파일 파싱 (탭, 쉼표, 또는 대시 구분) */
function parseTXT(content: string): FileParseResult {
  const lines = content.split(/\r?\n/);
  const result: FileParseResult = { success: [], errors: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 탭 구분자
    if (line.includes("\t")) {
      const parts = line.split("\t");
      if (parts[0]?.trim() && parts[1]?.trim()) {
        result.success.push({ word: parts[0].trim(), meaning: parts[1].trim() });
        continue;
      }
    }

    // 쉼표 구분자 (CSV와 동일 로직)
    if (line.includes(",")) {
      const fields = parseCSVLine(line);
      if (fields.length >= 2 && fields[0] && fields[1]) {
        result.success.push({ word: fields[0], meaning: fields[1] });
        continue;
      }
    }

    // 대시 구분자 (` - ` 또는 ` – `)
    const dashMatch = line.match(/^(.+?)\s+[-–]\s+(.+)$/);
    if (dashMatch) {
      result.success.push({ word: dashMatch[1].trim(), meaning: dashMatch[2].trim() });
      continue;
    }

    result.errors.push({ line: i + 1, content: line, reason: "word,meaning / word<탭>meaning / word - meaning 형식이 아닙니다" });
  }

  return result;
}

/** 파일 내용과 이름으로 단어 파싱 */
export function parseWordFile(content: string, filename: string): FileParseResult {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(content);
  return parseTXT(content);
}
