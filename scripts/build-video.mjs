/**
 * 리뷰 영상 변환기
 *
 *   node scripts/build-video.mjs "C:/Users/.../동영상 1.mp4" 2
 *                                 ^ 원본                      ^ 슬롯 번호(1~8)
 *
 * → public/videos/review-02.mp4
 *
 * 폰으로 찍은 영상은 그냥 넣으면 안 되는 이유가 둘 있습니다.
 *
 * 1. 아이폰은 H.265(HEVC)로 저장합니다. 크롬·파이어폭스에서 재생이 안 되고,
 *    카드가 조용히 자리표시로 바뀝니다. 그래서 H.264로 다시 인코딩합니다.
 * 2. 요즘 폰 영상은 HLG HDR입니다. 톤매핑 없이 변환하면 SDR 화면에서
 *    색이 바래고 밋밋해집니다. 그래서 BT.2020 HLG → BT.709 SDR 로 매핑합니다.
 *
 * 해상도는 810×1440 이면 충분합니다. 카드가 화면에서 제일 클 때가 384px 라
 * 1080은 용량만 두 배가 되고 보이는 차이는 없습니다.
 */
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import ffmpeg from "ffmpeg-static";

const [input, slot] = process.argv.slice(2);

if (!input || !slot) {
  console.error('사용법: node scripts/build-video.mjs "<원본파일>" <슬롯번호 1-8>');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`원본을 찾을 수 없습니다: ${input}`);
  process.exit(1);
}
const n = Number(slot);
if (!Number.isInteger(n) || n < 1) {
  console.error(`슬롯 번호가 이상합니다: ${slot}`);
  process.exit(1);
}

mkdirSync("public/videos", { recursive: true });
const out = `public/videos/review-${String(n).padStart(2, "0")}.mp4`;

// HLG(BT.2020) → 선형 → 톤매핑 → BT.709 SDR
const TONEMAP = [
  "zscale=t=linear:npl=100",
  "tonemap=tonemap=hable:desat=0",
  "zscale=p=bt709:t=bt709:m=bt709:r=tv",
  "format=yuv420p",
  "scale=810:1440:flags=lanczos",
].join(",");

execFileSync(
  ffmpeg,
  [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", input,
    "-vf", TONEMAP,
    "-c:v", "libx264", "-preset", "slow", "-crf", "26",
    "-profile:v", "high", "-level", "4.0",
    "-c:a", "aac", "-b:a", "128k", "-ac", "2",
    // 브라우저가 다 받기 전에 재생을 시작할 수 있게 인덱스를 앞으로
    "-movflags", "+faststart",
    out,
  ],
  { stdio: "inherit" }
);

console.log(`${out}  ${(statSync(out).size / 1048576).toFixed(2)} MB`);
