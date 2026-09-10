# /public/docs

## reports/
`TestReports.tsx` 가 읽는 시험성적서 스캔 이미지입니다.
`spf-01.jpg` … `spf-11.jpg`, `pa-01.jpg` … `pa-13.jpg`

## 인증서 PDF — 넣지 않습니다

인증서는 **보기 전용**입니다. 다운로드 버튼은 없앴습니다.

스캔본에 사업자등록번호 · 특허번호 · 대표 생년월일이 그대로 찍혀 있어서,
파일 자체가 밖으로 나가면 안 됩니다. 인증 섹션에서는 라이트박스로
크게 보는 것만 됩니다 (`src/components/Certifications.tsx`).

여기에 `cert_*.pdf` 를 넣어도 버튼은 생기지 않습니다.
