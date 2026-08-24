const fs = require('fs');
const file = 'src/lib/siteSettings.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /    subtitleAnimation: 'fade-up',[\s\S]*?aiDemo: \{/;

const target = `    subtitleAnimation: 'fade-up',
    subtitleColor: '',
    primaryBtnBase: '무료로 시작하기',
    primaryBtnLink: '#',
    secondaryBtnBase: '문의하기',
    secondaryBtnLink: '#',
    metricsColor: '#ffffff',
    metrics: {
      showVisits: true,
      showToday: true,
      showUsers: true,
      showActive: true,
      showSatisfaction: true
    }
  },
  features: {
    useWhiteBg: true,
    hidden: false,
    title: '기본에 충실한 <span class="gradient-text">운영 관리</span>',
    subtitle: '이미 수만 명의 디자이너가 검증한 \\'네이버\\'의 노하우를 그대로 담았습니다. \\n운영은 \\'헤어딜\\'에 맡기고, 디자이너님은 시술에만 집중하세요.',
    items: [
      { id: '1', hidden: false, icon: 'ShieldCheck', title: 'C2PA 표준 AI 출처 보증', description: '헤어딜 플랫폼에서 생성된 모든 콘텐츠는 C2PA 표준 기준에 따라 출처를 명확히 표기하며, 헤어 100% 보존 및 얼굴만 AI 모델 합성을 표준 기반으로 보증합니다.' },
      { id: '2', hidden: false, icon: 'CalendarCheck', title: '스마트 예약 관리', description: '네이버 예약, 카카오 헤어샵 연동은 기본. 중복 예약 없는 완벽한 실시간 예약 시스템을 제공합니다.' },
      { id: '3', hidden: false, icon: 'Users', title: '고도화된 고객 CRM', description: '고객별 시술 내역, 선호 스타일, 방문 주기 등을 한눈에 파악하고 맞춤형 서비스를 제공하세요.' },
      { id: '4', hidden: false, icon: 'PieChart', title: '정교한 매출 분석', description: '일간, 주간, 월간 매출 리포트와 시술별 수익률 분석으로 숍 운영의 효율성을 극대화합니다.' }
    ]
  },
  aiDemo: {`;

if (regex.test(content)) {
  content = content.replace(regex, target);
  fs.writeFileSync(file, content);
  console.log("File patched.");
} else {
  console.log("Regex didn't match.");
}
