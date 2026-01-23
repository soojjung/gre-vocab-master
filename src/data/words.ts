/**
 * GRE Vocabulary Data
 *
 * Sources:
 * - Manhattan Prep 1000 GRE Words: Definitions
 *   https://www.manhattanprep.com/gre/
 * - Target Test Prep GRE Vocabulary (PDF)
 *
 * Total: 1,689 words with definitions and examples
 */
import { words1 } from "./words-1";
import { words2 } from "./words-2";
import { words3 } from "./words-3";
import { words4 } from "./words-4";
import { words5 } from "./words-5";
import { words6 } from "./words-6";
import { words7 } from "./words-7";
import { words8 } from "./words-8";
import type { Word } from "@/types";

export const words: Word[] = [...words1, ...words2, ...words3, ...words4, ...words5, ...words6, ...words7, ...words8];
