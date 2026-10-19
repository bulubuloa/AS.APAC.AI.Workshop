import { execFileSync } from 'node:child_process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg: string = require('ffmpeg-static');

/**
 * Web video left, phone video right, same height, one mp4.
 * `phoneDelaySec` = how long after the web recording the phone recording started, so both clocks line up.
 */
export function sideBySide(web: string, phone: string, out: string, phoneDelaySec: number) {
  const filter =
    `[0:v]scale=-2:900,setsar=1[w];` +
    `[1:v]scale=-2:900,setsar=1,tpad=start_duration=${phoneDelaySec.toFixed(2)}:start_mode=clone[p];` +
    `[w][p]hstack=inputs=2:shortest=0,pad=ceil(iw/2)*2:ceil(ih/2)*2[v]`;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', web, '-i', phone, '-filter_complex', filter,
    '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', out]);
}
