import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보 처리방침 — HISKIN",
  description:
    "주식회사 지디엠(HISKIN)이 웹사이트 문의를 통해 수집하는 개인정보의 처리 목적, 항목, 보유 기간, 위탁, 정보주체의 권리를 안내합니다.",
  robots: { index: false },
};

/* The company facts here must match Footer.tsx's COMPANY block. The officer
   (김주현, 043-241-2011) was confirmed by the owner on 2026-09-15. */
const COMPANY = {
  name: "주식회사 지디엠",
  nameEn: "GDM Co., Ltd.",
  officer: "김주현",
  officerEn: "Juhyun Kim",
  tel: "043-241-2011",
  telIntl: "+82-43-241-2011",
  email: "sm44800@naver.com",
  address: "(28171) 충북 청주시 흥덕구 강내면 월곡길 38 충청대학 R동 120호",
};

const EFFECTIVE = "2026. 09. 15";

type Section = {
  ko: string;
  en: string;
  bodyKo: string[];
  bodyEn: string[];
};

/**
 * Each paragraph is one string; a leading "· " marks a list line. Korean
 * first, then the English rendering in a quieter tone, the way the reference
 * (project-pef.com/privacy.php) does it. The consignment section is ours:
 * inquiries are received and stored by Netlify Forms in the United States,
 * and 개인정보보호법 제28조의8 wants that disclosed with the recipient, the
 * items, the purpose and the retention.
 */
const SECTIONS: Section[] = [
  {
    ko: "총칙",
    en: "General",
    bodyKo: [
      `${COMPANY.name}(이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.`,
      "이 방침은 회사가 운영하는 HISKIN 웹사이트(hiskinlab.com)의 문의 양식을 통해 수집되는 개인정보에 적용됩니다.",
    ],
    bodyEn: [
      `${COMPANY.nameEn} (the "Company") establishes and discloses this privacy policy in accordance with Article 30 of the Personal Information Protection Act of Korea, in order to protect the personal information of data subjects and to handle related grievances promptly.`,
      "This policy applies to personal information collected through the inquiry form on the HISKIN website (hiskinlab.com).",
    ],
  },
  {
    ko: "개인정보의 처리 목적",
    en: "Purpose of processing",
    bodyKo: [
      "회사는 다음의 목적을 위해 개인정보를 처리하며, 처리한 개인정보는 다음의 목적 이외의 용도로는 이용하지 않습니다. 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.",
      "· 제품 문의, 파트너십(유통·도매·클리닉 등) 문의, 기타 문의에 대한 확인과 회신",
      "· 상담 이력의 관리 및 고지사항의 전달",
    ],
    bodyEn: [
      "The Company processes personal information for the purposes below and does not use it for any other purpose. Should the purpose change, the Company will obtain separate consent as required by Article 18 of the Act.",
      "· Confirming and responding to product, partnership (distribution, wholesale, clinic) and other inquiries",
      "· Managing the consultation history and delivering notices",
    ],
  },
  {
    ko: "수집하는 개인정보의 항목 및 방법",
    en: "Items collected and how",
    bodyKo: [
      "· 필수 항목: 이름, 회사명, 이메일, 국가, 문의 내용",
      "· 선택 항목: 예상 주문 수량 또는 요청 샘플 수량, 관심 분야",
      "· 수집 방법: 웹사이트의 파트너십 문의 양식(Distributor / Wholesale · Sample Request · Clinic & Aesthetic)",
      "· 서비스 이용 과정에서 접속 IP와 접속 일시가 양식 접수 시스템에 의해 자동으로 기록될 수 있습니다.",
    ],
    bodyEn: [
      "· Required: name, company, e-mail, country, message",
      "· Optional: expected order quantity or requested sample quantity, area of interest",
      "· Method: the website partnership inquiry form (Distributor / Wholesale, Sample Request, Clinic & Aesthetic)",
      "· The IP address and time of access may be recorded automatically by the form-handling system.",
    ],
  },
  {
    ko: "개인정보의 보유 및 이용 기간",
    en: "Retention period",
    bodyKo: [
      "회사는 문의 처리가 완료된 날부터 1년간 개인정보를 보유·이용한 뒤 지체 없이 파기합니다. 다만 관계 법령에서 일정 기간 보존을 요구하는 경우에는 그 기간 동안 보관합니다.",
      "· 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)",
    ],
    bodyEn: [
      "The Company retains personal information for one year from the date the inquiry is closed and then destroys it without delay, except where a longer period is required by law.",
      "· Records concerning consumer complaints or dispute handling: 3 years (Act on Consumer Protection in Electronic Commerce)",
    ],
  },
  {
    ko: "개인정보의 제3자 제공",
    en: "Provision to third parties",
    bodyKo: [
      "회사는 정보주체의 개인정보를 제2조의 목적 범위 내에서만 처리하며, 정보주체의 별도 동의가 있거나 법률에 특별한 규정이 있는 경우를 제외하고는 제3자에게 제공하지 않습니다.",
    ],
    bodyEn: [
      "The Company processes personal information only within the scope of Section 2 and does not provide it to third parties, except with the separate consent of the data subject or where specifically required by law.",
    ],
  },
  {
    ko: "개인정보 처리의 위탁 및 국외 이전",
    en: "Consignment and overseas transfer",
    bodyKo: [
      "회사는 문의 양식의 접수와 보관을 위해 아래와 같이 개인정보 처리를 위탁하며, 이 과정에서 개인정보가 국외로 이전됩니다.",
      "· 수탁자(이전받는 자): Netlify, Inc. (미국)",
      "· 위탁 업무: 웹사이트 문의 양식의 접수, 전송 및 보관",
      "· 이전되는 항목: 제3조의 수집 항목 전부",
      "· 이전 시점 및 방법: 정보주체가 문의를 제출하는 시점에 정보통신망을 통해 전송",
      "· 보유 기간: 제4조의 보유 기간과 같음",
      "정보주체는 국외 이전을 거부할 수 있으며, 이 경우 웹사이트 양식 대신 아래 개인정보 보호책임자의 전화 또는 이메일로 문의하실 수 있습니다.",
    ],
    bodyEn: [
      "To receive and store inquiries, the Company consigns the processing below, in the course of which personal information is transferred abroad.",
      "· Recipient: Netlify, Inc. (United States)",
      "· Consigned work: receiving, transmitting and storing website inquiry submissions",
      "· Items transferred: all items listed in Section 3",
      "· When and how: transmitted over the network at the moment the inquiry is submitted",
      "· Retention: the same as in Section 4",
      "You may refuse the overseas transfer; in that case, please contact the Personal Information Protection Officer below by phone or e-mail instead of using the form.",
    ],
  },
  {
    ko: "개인정보의 파기 절차 및 방법",
    en: "Destruction",
    bodyKo: [
      "회사는 보유 기간의 경과, 처리 목적의 달성 등으로 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.",
      "· 전자적 파일: 기록을 재생할 수 없는 기술적 방법으로 삭제",
      "· 종이 문서: 분쇄 또는 소각",
    ],
    bodyEn: [
      "When personal information becomes unnecessary — the retention period has passed or the purpose has been achieved — the Company destroys it without delay.",
      "· Electronic files: deleted by a technical method that prevents recovery",
      "· Paper records: shredded or incinerated",
    ],
  },
  {
    ko: "정보주체의 권리·의무 및 행사 방법",
    en: "Rights of the data subject",
    bodyKo: [
      "정보주체는 회사에 대해 언제든지 개인정보의 열람, 정정·삭제, 처리정지를 요구할 수 있습니다. 권리 행사는 아래 개인정보 보호책임자에게 서면, 전화 또는 이메일로 하실 수 있으며, 회사는 이에 대해 지체 없이 조치합니다.",
      "권리 행사는 정보주체의 법정대리인이나 위임을 받은 자를 통해서도 할 수 있으며, 이 경우 「개인정보 처리 방법에 관한 고시」 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.",
    ],
    bodyEn: [
      "You may at any time request access to, correction or deletion of, or suspension of processing of your personal information. Requests may be made in writing, by phone or by e-mail to the officer below, and the Company will act on them without delay.",
      "Requests may also be made through a legal representative or an authorised agent, in which case a power of attorney in the prescribed form must be submitted.",
    ],
  },
  {
    ko: "개인정보의 안전성 확보 조치",
    en: "Security measures",
    bodyKo: [
      "· 관리적 조치: 개인정보 취급 담당자의 최소화 및 교육, 내부 관리계획의 수립·시행",
      "· 기술적 조치: 접수 시스템에 대한 접근 권한 관리, 전송 구간 암호화(HTTPS)",
      "· 물리적 조치: 문서 보관 장소의 접근 통제",
    ],
    bodyEn: [
      "· Administrative: limiting and training staff who handle personal information; internal management plan",
      "· Technical: access control on the form-handling system; encryption in transit (HTTPS)",
      "· Physical: controlled access to where documents are kept",
    ],
  },
  {
    ko: "개인정보 보호책임자",
    en: "Personal Information Protection Officer",
    bodyKo: [
      "회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
      `· 개인정보 보호책임자: ${COMPANY.officer}`,
      `· 전화: ${COMPANY.tel}`,
      `· 이메일: ${COMPANY.email}`,
      `· 주소: ${COMPANY.address}`,
      "정보주체는 개인정보 침해에 대한 신고나 상담이 필요한 경우 개인정보침해신고센터(국번 없이 118, privacy.kisa.or.kr) 또는 개인정보분쟁조정위원회(1833-6972, kopico.go.kr)에 문의하실 수 있습니다.",
    ],
    bodyEn: [
      "The Company has appointed the following officer to take overall responsibility for the processing of personal information and to handle related complaints and remedies.",
      `· Officer: ${COMPANY.officerEn}`,
      `· Phone: ${COMPANY.telIntl}`,
      `· E-mail: ${COMPANY.email}`,
      `· Address: ${COMPANY.address}`,
      "For reports or counselling on privacy infringement you may also contact the Personal Information Infringement Report Center (118, privacy.kisa.or.kr) or the Personal Information Dispute Mediation Committee (1833-6972, kopico.go.kr).",
    ],
  },
  {
    ko: "개인정보 처리방침의 변경",
    en: "Changes to this policy",
    bodyKo: [
      `이 개인정보 처리방침은 ${EFFECTIVE}부터 적용됩니다. 법령이나 회사 방침에 따라 내용이 추가, 삭제 또는 수정되는 경우에는 시행 7일 전부터 웹사이트를 통해 공지합니다.`,
    ],
    bodyEn: [
      `This policy takes effect on ${EFFECTIVE}. Additions, deletions or amendments will be announced on the website at least seven days before they take effect.`,
    ],
  },
];

function Paragraphs({ lines, muted }: { lines: string[]; muted?: boolean }) {
  const tone = muted ? "text-mute" : "text-ink";
  return (
    <div className={`space-y-3 type-body-sm ${tone}`}>
      {lines.map((line) =>
        line.startsWith("· ") ? (
          <p key={line} className="flex gap-2.5 pl-1">
            <span className="shrink-0 select-none">·</span>
            <span>{line.slice(2)}</span>
          </p>
        ) : (
          <p key={line}>{line}</p>
        ),
      )}
    </div>
  );
}

/**
 * A plain document page, deliberately outside the one-pager's scroll and
 * animation stack: no Lenis, no GSAP, no preloader. It is opened from the
 * inquiry form's consent line in a new tab and has to read at once.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-[78px] max-w-5xl items-center justify-between px-6">
          <Link href="/" className="font-display type-logo font-semibold text-ink">
            HISKIN
          </Link>
          <Link
            href="/#inquiry"
            className="type-nav font-medium text-mute transition-colors hover:text-ink"
          >
            문의로 돌아가기
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 pt-16 md:pt-24">
        <p className="eyebrow-tag mb-6">Privacy</p>
        <h1 className="font-display type-h2 font-medium text-ink">
          개인정보 처리방침
          <br />
          Privacy Policy
        </h1>
        <p className="mt-6 type-sub text-mute">
          시행일 {EFFECTIVE} · Effective {EFFECTIVE}
        </p>

        <ol className="mt-16 md:mt-24">
          {SECTIONS.map((s, i) => (
            <li
              key={s.ko}
              className="grid gap-6 border-t border-hairline py-10 md:grid-cols-12 md:gap-10 md:py-12"
            >
              <div className="md:col-span-4">
                <p className="type-caption font-semibold tracking-[0.12em] text-mute">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-display type-h3 font-medium text-ink">
                  {s.ko}
                </h2>
                <p className="mt-1 type-body-sm text-mute">{s.en}</p>
              </div>
              <div className="space-y-6 md:col-span-8">
                <Paragraphs lines={s.bodyKo} />
                <Paragraphs lines={s.bodyEn} muted />
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 border-t border-hairline pt-6 type-caption text-mute">
          {COMPANY.name} · {COMPANY.address}
        </p>
      </main>
    </div>
  );
}
