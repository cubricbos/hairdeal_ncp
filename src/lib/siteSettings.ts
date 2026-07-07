export interface SiteSettings {
  nav: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImage: string;
    logoWidth?: string;
    logoHeight?: string;
    links: { id: string; label: string; href: string; hidden?: boolean }[];
    mypageMenu?: {
      aiModel?: string;
      csAdmin?: string;
      siteEditor?: string;
      saasAdmin?: string;
      shop: string;
      profile: string;
      portfolio: string;
      subscription: string;
      billing: string;
      credits: string;
      reports: string;
      instagram: string;
      marketing: string;
      referral?: string;
    };
    mypageMenuVisibility?: Record<string, boolean>;
  };
  hero: {
    bgType: 'image' | 'video';
    bgColor?: string;
    bgImage: string;
    bgImages?: (string | { id: string; url: string })[];
    bgTransitionTime?: number;
    bgVideo: string;
    bgAnimation: 'zoom-out' | 'slide' | 'fade-slider' | 'zoom-fade-slider' | 'none';
    bgShowFirstImageImmediately?: boolean;
    overlayStartColor?: string;
    overlayStartOpacity?: number;
    overlayEndColor?: string;
    overlayEndOpacity?: number;
    showBadge: boolean;
    badgeText: string;
    title: string;
    titleAnimation: string;
    titleColor?: string;
    subtitle: string;
    subtitleColor?: string;
    subtitleAnimation: string;
    primaryBtnBase: string;
    primaryBtnLink: string;
    secondaryBtnBase: string;
    secondaryBtnLink: string;
    metricsColor?: string;
    metrics: {
      showVisits: boolean;
      showToday: boolean;
      showUsers: boolean;
      showActive: boolean;
      showSatisfaction: boolean;
    };
  };
  features: {
    hidden?: boolean;
    useWhiteBg?: boolean;
    title: string;
    subtitle: string;
    items: {
      id: string;
      hidden: boolean;
      iconType?: 'lucide' | 'emoji' | 'image';
      icon: string;
      title: string;
      description: string;
    }[];
  };
  aiDemo: {
    hidden?: boolean;
    useWhiteBg?: boolean;
    showBadge: boolean;
    badgeText: string;
    title: string;
    titleAnimation: string;
    subtitle: string;
    subtitleAnimation: string;
    blurStrength: number;
    appStoreLink: string;
    appStoreImg: string;
    playStoreLink: string;
    playStoreImg: string;
    ctaText: string;
    ctaLink: string;
  };
  pricing: {
    hidden?: boolean;
    useWhiteBg?: boolean;
    title: string;
    subtitle: string;
    yearlyDiscountRate: number;
    yearlyBillingEnabled: boolean;
    plans: {
      id: string;
      hidden: boolean;
      name: string;
      subtitle: string;
      monthlyPrice: number;
      individualDiscountEnabled?: boolean;
      individualDiscountRate: number;
      applyIndividualDiscountToYearly?: boolean;
      qrServiceEnabled?: boolean;
      features: { id: string; text: string }[];
      buttonText: string;
      buttonLink: string;
      buttonStyle: 'primary' | 'outline';
      isPopular: boolean;
      popularText: string;
    }[];
  };
  cta: {
    hidden: boolean;
    type: 'default' | 'image';
    title: string;
    subtitle: string;
    primaryBtn: string;
    secondaryBtn: string;
  };
  footer: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImage: string;
    logoWidth?: string;
    logoHeight?: string;
    subtitle: string;
    social: { id: string; platform: string; link: string; icon: string }[];
    companyLinks: { id: string; label: string; link: string }[];
    serviceLinks: { id: string; label: string; link: string }[];
    contact: { 
      email: string; 
      phone: string; 
      address: string; 
      workingHours: string;
      showEmail?: boolean;
      showPhone?: boolean;
      showAddress?: boolean;
      showWorkingHours?: boolean;
    };
    copyright: string;
    policies: {
      terms: string;
      privacy: string;
    };
  };
  layers?: {
    id: string;
    name: string;
    hidden: boolean;
    anchorId: string;
    title: string;
    subtitle: string;
    contentHtml: string;
    showTitle?: boolean;
    showSubtitle?: boolean;
    primaryBtn?: string;
    primaryBtnLink?: string;
    primaryBtnColor?: string;
    secondaryBtn?: string;
    secondaryBtnLink?: string;
    secondaryBtnColor?: string;
    openModal?: string;
    buttons?: LayerButton[];
    useGlassCard?: boolean;
    useWhiteBg?: boolean;
    refinementHistory?: RefinementHistoryItem[];
  }[];
  sectionOrder?: string[];
  integrations?: {
    facefusionUrl: string;
    geminiApiKey?: string;
    geminiApiKeys?: {
      id: string;
      key: string;
      model: string;
      label: string;
      isExhausted: boolean;
      usageCount: number;
      lastExhaustedAt?: string;
      isActive?: boolean;
    }[];
  };
  seoSettings?: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    aiAutoEnabled: boolean;
    aiUpdateInterval: 'daily' | 'weekly' | 'monthly';
    targetKeywords: string[];
    lastAnalyzedAt?: string;
  };
  promoSettings?: {
    enabled: boolean;
    platforms: string[];
    frequency: 'daily' | 'weekly' | 'custom';
    tone: string;
    mainPromoContent?: string;
    lastPostedAt?: string;
    credentials?: {
      instagram?: { connected: boolean; username?: string };
      naver?: { connected: boolean; username?: string };
      kakao?: { connected: boolean; openChatUrl?: string };
    };
    history?: {
      id: string;
      createdAt: string;
      content: string;
      mainPromoContent: string;
      status: Record<string, 'success' | 'failed' | 'pending'>;
      platformContents?: Record<string, string>;
    }[];
  };
  partnerSettings?: {
    hidden?: boolean;
    useWhiteBg?: boolean;
  };
  partners: {
    id: string;
    logoImage: string;
    linkUrl?: string;
    name?: string;
    hidden?: boolean;
  }[];
  parkingPage?: {
    enabled: boolean;
    type: 'maintenance' | 'coming-soon' | 'custom';
    title: string;
    subtitle: string;
    bgImage: string;
    bgColor: string;
    adminId?: string;
    adminPassword?: string;
  };
  popups?: {
    id: string;
    enabled: boolean;
    title: string;
    contentHtml: string;
    linkUrl: string;
    linkText: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    positionX: number;
    positionY: number;
  }[];
  eventPosts?: {
    id: string;
    title: string;
    contentHtml: string;
    imageUrl?: string;
    isPublished: boolean;
    createdAt: string;
  }[];
  creditSettings?: {
    chargeOptionsEnabled: boolean;
  };
}

export interface LayerButton {
  label: string;
  actionType: 'section' | 'link' | 'modal';
  targetId?: string | null;
  linkUrl?: string | null;
  colorClass?: string;
}

export interface RefinementHistoryItem {
  id: string;
  timestamp: string;
  prompt: string;
  beforeContent: string;
  afterContent: string;
}

export const defaultSiteSettings: SiteSettings = {
  nav: {
    logoType: 'text',
    logoText: 'HAIR_DEAL',
    logoImage: '',
    logoWidth: 'auto',
    logoHeight: '32px',
    links: [
      { id: '1', label: '기능소개', href: '/#features' },
      { id: '2', label: 'AI스튜디오', href: '/#marketing' },
      { id: '3', label: '요금안내', href: '/#pricing' },
    ],
    mypageMenu: {
      aiModel: 'AI 헤어모델 생성',
      csAdmin: 'CS 관리자 페이지',
      siteEditor: '홈페이지 편집',
      saasAdmin: 'SaaS 관리자 대시보드',
      shop: 'QR 서비스 관리',
      profile: '프로필 정보',
      portfolio: '포트폴리오',
      subscription: '구독관리',
      billing: '결제관리',
      credits: '크레딧 관리',
      reports: '보고서',
      instagram: '인스타그램 계정관리',
      marketing: '마케팅 보고서',
    }
  },
  hero: {
    bgType: 'image',
    bgColor: '#000000',
    bgImage: '',
    bgImages: [],
    bgTransitionTime: 3,
    bgVideo: '',
    bgAnimation: 'zoom-out',
    bgShowFirstImageImmediately: true,
    overlayStartColor: '#ffffff',
    overlayStartOpacity: 100,
    overlayEndColor: '#ffffff',
    overlayEndOpacity: 0,
    showBadge: true,
    badgeText: 'AI HAIR STUDIO V2.4',
    title: '헤어 모델 구인, \\n이제 <span class="gradient-text">AI로 끝내세요</span>',
    titleAnimation: 'fade-up',
    titleColor: '',
    subtitle: '스마트폰 사진 한 장으로 완성되는 완벽한 헤어 모델 포트폴리오.\\n더이상 비싼 비용을 들여 모델을 구하지 마세요.',
    subtitleAnimation: 'fade-up',
    subtitleColor: '',
    primaryBtnBase: '무료 시작하기',
    primaryBtnLink: '#',
    secondaryBtnBase: '도입 문의하기',
    secondaryBtnLink: '#',
    metricsColor: '',
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
    subtitle: '이미 수만 명의 디자이너가 검증한 \'네이버\'의 노하우를 그대로 담았습니다. \\n운영은 \'헤어딜\'에 맡기고, 디자이너님은 시술에만 집중하세요.',
    items: [
      { id: '1', hidden: false, icon: 'CalendarCheck', title: '스마트 예약 관리', description: '네이버 예약, 카카오 헤어샵 연동은 기본. 중복 예약 없는 완벽한 실시간 예약 시스템을 제공합니다.' },
      { id: '2', hidden: false, icon: 'Users', title: '고도화된 고객 CRM', description: '고객별 시술 내역, 선호 스타일, 방문 주기 등을 한눈에 파악하고 맞춤형 서비스를 제공하세요.' },
      { id: '3', hidden: false, icon: 'PieChart', title: '정교한 매출 분석', description: '일간, 주간, 월간 매출 리포트와 시술별 수익률 분석으로 숍 운영의 효율성을 극대화합니다.' },
      { id: '4', hidden: false, icon: 'MessageSquare', title: '자동 마케팅 문자', description: '방문 후 감사 문자, 노쇼 방지 알림, 생일 축하 쿠폰 등을 자동으로 발송하여 고객 유지율을 높입니다.' },
      { id: '5', hidden: false, icon: 'Smartphone', title: '모바일 최적화 앱', description: '언제 어디서나 스마트폰 하나로 숍의 모든 상황을 체크하고 관리할 수 있습니다.' },
      { id: '6', hidden: false, icon: 'Zap', title: '간편한 결제 시스템', description: '선결제, 회원권 관리, 포인트 적립까지 복잡한 정산 과정을 단 몇 번의 터치로 끝내세요.' }
    ]
  },
  aiDemo: {
    useWhiteBg: false,
    hidden: false,
    showBadge: true,
    badgeText: 'Hairdeal 2.0 AI Engine',
    title: '"딸깍" 한 번으로 완성되는 \\n<span class="gradient-text">압도적인 포트폴리오</span>',
    titleAnimation: 'fade-up',
    subtitle: '시술한 <strong>헤어 스타일은 그대로 보존</strong>하면서, \\n원하는 모델의 <strong>얼굴만 자연스럽게 합성</strong>하고, 인스타그램 홍보 글귀까지, \\nAI가 자동으로 작성해드립니다.',
    subtitleAnimation: 'fade-up',
    blurStrength: 1,
    appStoreLink: 'https://www.cubric.io',
    appStoreImg: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg',
    playStoreLink: 'https://www.cubric.io',
    playStoreImg: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg',
    ctaText: 'AI 헤어모델 체험하기',
    ctaLink: '/ai-hair-model'
  },
  pricing: {
    useWhiteBg: true,
    hidden: false,
    title: '정직하고 투명한 요금제',
    subtitle: '숨겨진 비용 없이 숍 규모와 필요에 맞는 최적의 플랜을 선택하세요.\\n모든 플랜은 14일 무료 체험이 제공됩니다.',
    yearlyDiscountRate: 20,
    yearlyBillingEnabled: true,
    plans: [
      {
        id: '1', hidden: false, name: '베이직 플랜', subtitle: '1인샵 / 소규모 매장용', monthlyPrice: 29000, individualDiscountRate: 0,
        features: [{ id: '1-1', text: '예약 및 고객 관리 (최대 1,000명)' }, { id: '1-2', text: '매출 관리 및 리포트' }, { id: '1-3', text: '월 500건 알림톡 발송 지원' }],
        buttonText: '14일 무료 체험', buttonLink: '#', buttonStyle: 'outline',
        isPopular: false, popularText: ''
      },
      {
        id: '2', hidden: false, name: '프로 플랜', subtitle: '중대형 프랜차이즈, 다점포 관리', monthlyPrice: 59000, individualDiscountRate: 0,
        features: [{ id: '2-1', text: '베이직 플랜 모든 기능 포함' }, { id: '2-2', text: 'AI 포트폴리오 스튜디오 (무제한)' }, { id: '2-3', text: '인스타그램 자동 포스팅 연동' }, { id: '2-4', text: '고급 마케팅 자동화 캠페인 제공' }, { id: '2-5', text: '전담 매니저의 1:1 세팅 지원' }],
        buttonText: '프로 플랜 시작하기', buttonLink: '#', buttonStyle: 'primary',
        isPopular: true, popularText: 'MOST POPULAR'
      }
    ]
  },
  cta: {
    hidden: false,
    type: 'default',
    title: '지금 바로 헤어딜 <span class="gradient-text">\'딸깍\'</span> 하세요!',
    subtitle: '헤어딜은 모든 미용인들이 오직 시술에만 집중할 수 있도록 \\n예약 관리부터 매출 끌어올리는 AI 포트폴리오까지, \\n이제 더이상 비싼 마케팅 강의는 듣지 마세요! \\n헤어딜 \'딸깍\' 한번이면 개인 브랜딩 마케팅이 해결됩니다. \\n더 이상 고민하지 마시고 지금 바로 무료체험을 시작 하세요!',
    primaryBtn: '무료 체험 시작하기',
    secondaryBtn: '도입 문의하기'
  },
  footer: {
    logoType: 'text',
    logoText: 'HAIR_DEAL',
    logoImage: '',
    logoWidth: 'auto',
    logoHeight: '32px',
    subtitle: '국내 1위 미용실 AI 마케팅 솔루션',
    social: [
      { id: '1', platform: 'Instagram', link: '#', icon: 'Instagram' },
      { id: '2', platform: 'Youtube', link: '#', icon: 'Youtube' }
    ],
    companyLinks: [
      { id: '1', label: '회사 소식', link: '#' },
      { id: '2', label: '인재 채용', link: '#' },
      { id: '3', label: '기술 블로그', link: '#' }
    ],
    serviceLinks: [
      { id: '1', label: '헤어딜 딸깍', link: '#' },
      { id: '2', label: 'AI 랜드마크 분석', link: '#' },
      { id: '3', label: 'AI 헤어 페인팅', link: '#' },
      { id: 'event_link', label: '이벤트', link: '/events' }
    ],
    contact: {
      email: 'hello@hairdeal.io',
      phone: '1588-0000',
      address: '서울특별시 강남구 테헤란로 123, 헤어딜타워 15층',
      workingHours: '평일 10:00 ~ 18:00 (주말 및 공휴일 제외)',
      showEmail: true,
      showPhone: true,
      showAddress: true,
      showWorkingHours: true
    },
    copyright: '© 2024 Hairdeal Inc. All rights reserved.',
    policies: {
      terms: `...`,
      privacy: `...`
    }
  },
  layers: [
    {
      id: "layer_1",
      name: "01 레이어",
      hidden: false,
      anchorId: "",
      title: '지금 바로 헤어딜 <span class="gradient-text">\'딸깍\'</span> 하세요!',
      subtitle: '헤어딜은 모든 미용인들이 오직 시술에만 집중할 수 있도록 \\n예약 관리부터 매출 끌어올리는 AI 포트폴리오까지, \\n이제 더이상 비싼 마케팅 강의는 듣지 마세요! \\n헤어딜 \'딸깍\' 한번이면 개인 브랜딩 마케팅이 해결됩니다. \\n더 이상 고민하지 마시고 지금 바로 무료체험을 시작 하세요!',
      contentHtml: "",
      showTitle: true,
      showSubtitle: true,
      primaryBtn: '무료 체험 시작하기',
      primaryBtnLink: '#',
      primaryBtnColor: 'bg-brand-primary text-white',
      secondaryBtn: '도입 문의하기',
      secondaryBtnLink: '#',
      secondaryBtnColor: 'bg-white text-gray-900 border border-gray-200'
    }
  ],
  sectionOrder: ['features', 'aiDemo', 'pricing', 'partners', 'layer_1'],
  integrations: {
    facefusionUrl: ''
  },
  seoSettings: {
    title: 'Hairdeal - 헤어디자이너를 위한 AI 솔루션',
    description: 'AI 모델 렌덤 생성, 스마트 예약 관리 및 고도화된 고객 CRM 시스템을 제공하는 헤어디자이너 필수 플랫폼 헤어딜입니다.',
    keywords: '헤어디자이너, 미용실 관리, AI 헤어모델, 헤어스타일, CRM 시스템, 스마트 예약, 미용실 마케팅',
    ogImage: 'https://images.unsplash.com/photo-1521590832167-7bfcbaa6362d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    aiAutoEnabled: false,
    aiUpdateInterval: 'weekly',
    targetKeywords: ['헤어디자이너 인플루언서', '미용실 마케팅 교육', '헤어 제품 추천', '최신 헤어스타일 트렌드']
  },
  promoSettings: {
    enabled: false,
    platforms: ['instagram', 'naver_cafe'],
    frequency: 'weekly',
    tone: 'professional'
  },
  partnerSettings: {
    hidden: false,
    useWhiteBg: true
  },
  partners: [
    { id: '1', name: 'Partner 1', logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: '2', name: 'Partner 2', logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
    { id: '3', name: 'Partner 3', logoImage: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80' },
  ],
  parkingPage: {
    enabled: false,
    type: 'maintenance',
    title: '시스템 점검 중입니다',
    subtitle: '더 나은 서비스를 위해 사이트 점검을 진행하고 있습니다.\\n이용에 불편을 드려 죄송합니다.',
    bgImage: '',
    bgColor: '#111827'
  },
  popups: [
    {
      id: 'popup-1',
      enabled: false,
      title: '새로운 이벤트 오픈!',
      contentHtml: '지금 확인해보세요.',
      linkUrl: '/events',
      linkText: '이벤트 바로가기',
      imageUrl: '',
      startDate: '',
      endDate: '',
      positionX: 50,
      positionY: 50
    }
  ],
  eventPosts: [],
  creditSettings: {
    chargeOptionsEnabled: false
  }
};
