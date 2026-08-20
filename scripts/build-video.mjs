/**
 * 리뷰 영상 변환기
 *
 *   node scripts/build-video.mjs "C:/Users/.../동영상 1.mp4" 2 3.7
 *                                 ^ 원본                      ^ 슬롯  ^ 썸네일 시각(초, 생략가능)
 *
 * → public/videos/review-02.mp4  +  review-02.jpg (썸네일)
 *
 * 썸네일 시각을 정할 땐 몇 초쯤을 몇 개 뽑아서 눈으로 고르세요.
 * 눈 감은 프레임이 걸리는 일이 은근히 잦습니다.
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

const [input, slot, posterAt = "1", flip] = process.argv.slice(2);

if (!input || !slot) {
  console.error(
    '사용법: node scripts/build-video.mjs "<원본파일>" <슬롯번호 1-8> [썸네일시각(초)] [flip]'
  );
  console.error(
    "  flip — 좌우 반전. 제품 라벨이 거울글씨로 나오는 영상에 씁니다."
  );
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

// 원본이 HDR 인지 먼저 봅니다. 톤매핑은 HDR 에만 걸어야 합니다 —
// 이미 SDR 인 영상에 걸면 한 번 더 눌려서 색이 빠지고 대비가 뭉개집니다.
// (AI 로 만든 영상이나 카톡으로 받은 영상은 대부분 이미 SDR 입니다.)
let probe = "";
try {
  execFileSync(ffmpeg, ["-hide_banner", "-i", input], {
    stdio: ["ignore", "ignore", "pipe"],
  });
} catch (e) {
  probe = e.stderr.toString();
}
const isHDR = /arib-std-b67|smpte2084/.test(probe);

// 세로 카드(810×1440)를 꽉 채우되 비율은 지킵니다. 넘치는 쪽을 잘라냅니다 —
// force_original_aspect_ratio 없이 scale=810:1440 만 쓰면 원본이 9:16 이
// 아닐 때 그대로 늘어납니다. 가로 영상은 특히 심하게 찌그러집니다.
const FIT = "scale=810:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=810:1440";

// HLG(BT.2020) → 선형 → 톤매핑 → BT.709 SDR
const TONEMAP = [
  "zscale=t=linear:npl=100",
  "tonemap=tonemap=hable:desat=0",
  "zscale=p=bt709:t=bt709:m=bt709:r=tv",
  "format=yuv420p",
  FIT,
].join(",");

// 좌우 반전. AI 로 만든 영상은 제품 라벨이 거울글씨로 나오는 경우가 있는데,
// 프레임 전체를 뒤집으면 브랜드명이 바로 읽힙니다. 화면 안에 다른 글자가
// 있으면 그쪽이 대신 뒤집히니 결과를 눈으로 확인하세요.
const doFlip = flip === "flip";

const VF = [
  ...(doFlip ? ["hflip"] : []),
  ...(isHDR ? [TONEMAP] : ["format=yuv420p", FIT]),
].join(",");
console.log(
  `원본: ${isHDR ? "HDR — 톤매핑 적용" : "SDR — 톤매핑 생략"}${doFlip ? " · 좌우 반전" : ""}`
);

execFileSync(
  ffmpeg,
  [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", input,
    "-vf", VF,
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

// 썸네일. 변환된 파일에서 뽑아야 톤매핑된 색이 그대로 나옵니다.
const poster = out.replace(/\.mp4$/, ".jpg");
execFileSync(
  ffmpeg,
  ["-hide_banner", "-loglevel", "error", "-y",
   "-ss", String(posterAt), "-i", out, "-vframes", "1", "-q:v", "3", poster],
  { stdio: "inherit" }
);
console.log(`${poster}  ${(statSync(poster).size / 1024).toFixed(0)} KB  (${posterAt}초)`);
console.log(
  `\nVideoGrid.tsx 의 REVIEWS[${n - 1}] 에 poster: "/videos/review-${String(n).padStart(2, "0")}.jpg" 를 추가하세요.`
);
