// One-Line Office Joke: 24-Hour Sprint — make.fun entry.
//
// Writes a single-line office joke to entry.txt (or
// $MAKEFUN_OUTPUT_DIR/entry.txt when set) and validates it against the
// bounty gate: UTF-8 text, exactly one line, 1-200 characters, not only
// whitespace, no trailing newline. Exits non-zero if any check fails,
// so a bad entry can never be graded by accident.
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "Our daily stand-up has been sitting down for 45 minutes, and someone just suggested a follow-up meeting to discuss why it ran long.";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`gate: FAIL — ${message}`);
  process.exit(1);
}

function validate(text: string): void {
  // Gate 1: length in characters (the bounty counts characters, max 200).
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    fail(`length ${chars} chars is outside the 1-${MAX_CHARS} range`);
  }
  // Gate 2: exactly one line — no newline or carriage return anywhere.
  if (text.includes("\n") || text.includes("\r")) {
    fail("text contains a line break; the joke must be a single line");
  }
  // Gate 3: not only whitespace, and no stray leading/trailing spaces.
  if (text.trim().length === 0) fail("text is only whitespace");
  if (text.trim() !== text) fail("text has leading or trailing whitespace");
  // Gate 4: it must read as one sentence-ish joke, not a bare fragment.
  if (!/[.!?]$/.test(text)) fail("text does not end with terminal punctuation");
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || process.cwd();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  validate(JOKE);
  writeFileSync(outPath, JOKE, "utf8");

  // Read-back verify: what landed on disk must be byte-identical to JOKE.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== JOKE) fail("read-back mismatch: entry.txt differs from JOKE");
  const bytes = Buffer.byteLength(onDisk, "utf8");
  const chars = [...onDisk].length;

  console.log(`wrote ${outPath}`);
  console.log(`chars: ${chars} (max ${MAX_CHARS})`);
  console.log(`bytes: ${bytes}`);
  console.log(`joke: ${onDisk}`);
  console.log("gate: PASS");
}

main();
