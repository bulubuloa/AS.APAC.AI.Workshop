import { readFileSync } from 'node:fs';
import path from 'node:path';

// One source for the journey steps: the workbook sheet 23, the deck and these tests all use e2e-steps.json
const J = JSON.parse(readFileSync(path.join(__dirname, '..', 'e2e-steps.json'), 'utf-8'));

/** "Web: Agent sets the incident pin" - the side becomes the caption tag, the short label the caption text. */
export function stepTitles(tid: string): string[] {
  return J[tid].steps.map(([side, , , short]: string[]) => `${side}: ${short}`);
}
