// Deadpan Forecasts for Cities That Do Not Exist — make.fun entry
// Bounty: u-coral-ibis-18-deadpan-forecasts-for-cities-that-do-151d4d8c
//
// Chosen line (107 code points, gate is 1-160):
//   "In New Throstle, overnight lows of minus 3, with frost forming exclusively on the left side of parked cars."
//
// Why this line: it reads as a plain broadcast sentence — invented town,
// a temperature, and one impossible detail delivered without comment.
// The frost is specific and visual (left side only), the tone stays flat,
// and the length leaves no padding. It was the best of 10 candidates
// scored on subject, surprise, deadpan voice, memorability and gate fit.

import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

const ENTRY_LINE =
  "In New Throstle, overnight lows of minus 3, with frost forming exclusively on the left side of parked cars.";

const OUTPUT_PATH = "/output/entry.txt";
const TEMP_PATH = "/output/entry.txt.tmp";

function fail(message: string): never {
  console.error(`gate check failed: ${message}`);
  process.exit(1);
}

// --- Gate checks (mirror the sealed scorer, tightened for safety) ---
// 1) Code-point length must be 1..160. Spread counts code points, not bytes.
const codePoints = [...ENTRY_LINE];
if (codePoints.length < 1 || codePoints.length > 160) {
  fail(`length ${codePoints.length} outside 1..160`);
}

// 2) Must not be only whitespace.
if (ENTRY_LINE.trim().length === 0) {
  fail("line is only whitespace");
}

// 3) Must be a single line: no line breaks of any flavour.
if (/[\n\r\u2028\u2029]/.test(ENTRY_LINE)) {
  fail("line contains a line break");
}

// 4) No leading or trailing whitespace (judge sees the raw text).
if (ENTRY_LINE !== ENTRY_LINE.trim()) {
  fail("line has leading or trailing whitespace");
}

// 5) No control characters or invisible format characters.
for (const ch of codePoints) {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp < 0x20 || cp === 0x7f) {
    fail(`control character U+${cp.toString(16)} present`);
  }
  if (
    cp === 0x200b || // zero width space
    cp === 0x200c || // zero width non-joiner
    cp === 0x200d || // zero width joiner
    cp === 0xfeff // byte order mark
  ) {
    fail(`invisible character U+${cp.toString(16)} present`);
  }
}

// --- Write atomically: temp file in /output, then rename over the target ---
// Rename within the same directory is atomic, so a reader never sees a
// half-written entry; the temp name is fixed because runs are sequential.
mkdirSync("/output", { recursive: true });
writeFileSync(TEMP_PATH, ENTRY_LINE, { encoding: "utf8", mode: 0o644 });
chmodSync(TEMP_PATH, 0o644);
renameSync(TEMP_PATH, OUTPUT_PATH);
chmodSync(OUTPUT_PATH, 0o644);

// --- Read back and confirm the file holds exactly the chosen line ---
const written = readFileSync(OUTPUT_PATH, "utf8");
if (written !== ENTRY_LINE) {
  fail("written file does not match the chosen line");
}

console.log(`wrote ${codePoints.length} code points to ${OUTPUT_PATH}`);
