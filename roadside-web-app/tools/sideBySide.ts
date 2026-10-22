import { execFileSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg: string = require('ffmpeg-static');

/** A test step as seconds from the start of the web recording - shown as a caption under the video. */
export type Caption = { start: number; end: number; text: string };

/**
 * Web video left, phone video right, same height, one mp4, with an optional caption bar naming the current step.
 * `phoneDelaySec` = how long after the web recording the phone recording started, so both clocks line up.
 */
export function sideBySide(web: string, phone: string, out: string, phoneDelaySec: number, captions: Caption[] = []) {
  const dir = path.dirname(out);
  let caps = '';
  if (captions.length) {
    // ffmpeg filter options treat ":" as a separator, so font and texts sit next to the output and are passed by bare name
    copyFileSync(process.env.CAPTION_FONT ?? (process.platform === 'win32' ? 'C:/Windows/Fonts/segoeuib.ttf' : '/System/Library/Fonts/Supplemental/Arial Bold.ttf'), path.join(dir, 'caption.ttf'));
    caps = ',pad=iw:ih+70:0:0:0x1E2761' + captions.map((c, i) => {
      writeFileSync(path.join(dir, `cap${i}.txt`), c.text);
      return `,drawtext=fontfile=caption.ttf:textfile=cap${i}.txt:fontcolor=white:fontsize=30:x=24:y=h-52:` +
        `enable='between(t\\,${c.start.toFixed(2)}\\,${c.end.toFixed(2)})'`;
    }).join('');
  }
  const filter =
    `[0:v]scale=-2:900,setsar=1[w];` +
    `[1:v]scale=-2:900,setsar=1,tpad=start_duration=${phoneDelaySec.toFixed(2)}:start_mode=clone[p];` +
    `[w][p]hstack=inputs=2:shortest=0${caps},pad=ceil(iw/2)*2:ceil(ih/2)*2[v]`;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', path.resolve(web), '-i', path.resolve(phone), '-filter_complex', filter,
    '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', path.basename(out)], { cwd: dir });
}

/** Wraps test.step so each step also becomes a numbered caption: "3  WEB  Admin creates ...". */
export function captioned(t0: number, caps: Caption[], step: <T>(title: string, body: () => Promise<T>) => Promise<T>) {
  return async <T>(title: string, body: () => Promise<T>): Promise<T> => {
    const start = (Date.now() - t0) / 1000;
    try {
      return await step(title, body);
    } finally {
      const [side, ...rest] = title.split(':');
      const text = rest.length ? `${caps.length + 1}   ${side.toUpperCase()}   ${rest.join(':').trim()}` : `${caps.length + 1}   ${title}`;
      caps.push({ start, end: (Date.now() - t0) / 1000, text });
    }
  };
}
