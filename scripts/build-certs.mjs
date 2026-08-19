// One-off: normalise the five certificate scans into identical A4 sheets.
//
// The sources arrive at four different aspect ratios and one of them (the
// ISO 22716 registration) is stored rotated 90°. Padding each to a true
// 1:1.414 on white means every tile fills its frame the same way instead of
// letterboxing by a different amount.
import sharp from "sharp";

const W = 1500;
const H = Math.round(W * 1.414); // 2121

const SRC = "C:/Users/kryst/Downloads";
const OUT = "public/images";

const JOBS = [
  { out: "cert_iso22716", file: `${SRC}/주식회사 지디엠 iso _ 우수화장품 제조 및 품질관리 인증서.png`, rotate: 90 },
  { out: "cert_mfg_license", file: `${SRC}/등록필증 -3.jpg` },
  { out: "cert_patent", file: `${SRC}/특허증 -2.jpg` },
  { out: "cert_rnd_lab", file: `${SRC}/기업연구소 인정서 -1.jpg` },
  { out: "cert_irdop_analysis", file: `${SRC}/phieu-ket-qua-thu-nghiem-hiskin.webp` },
];

for (const job of JOBS) {
  const before = await sharp(job.file).metadata();
  await sharp(job.file)
    .rotate(job.rotate ?? 0)
    .flatten({ background: "#ffffff" })
    .resize(W, H, {
      fit: "contain",
      background: "#ffffff",
      kernel: "lanczos3",
    })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(`${OUT}/${job.out}.jpg`);

  const after = await sharp(`${OUT}/${job.out}.jpg`).metadata();
  console.log(
    `${job.out.padEnd(22)} ${before.width}x${before.height}` +
      `${job.rotate ? ` (rot ${job.rotate}°)` : ""} -> ${after.width}x${after.height}`
  );
}
