export interface LayerButton {
  text: string;
  link: string;
  color: string;
  action?: 'link' | 'modal' | 'scroll' | 'section';
  target?: string;
  actionType?: 'link' | 'modal' | 'scroll' | 'section';
  targetId?: string;
  linkUrl?: string;
  colorClass?: string;
  label?: string;
}

export interface RefinementHistoryItem {
  id?: string;
  date?: string;
  timestamp?: string;
  details?: string;
  prompt?: string;
  beforeContent?: string;
  afterContent?: string;
}

export interface SiteSettings {
  nav: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImage: string;
    logoWidth?: string;
    logoHeight?: string;
    primaryBtnText?: string;
    primaryBtnAction?: 'section' | 'link' | 'modal';
    primaryBtnTarget?: string;
    loginBtnText?: string;
    loginBtnAction?: 'section' | 'link' | 'modal';
    loginBtnTarget?: string;
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
    languageSettings?: {
      enabled: boolean;
      availableLanguages: string[];
    };
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
      showEmail: boolean;
      showPhone: boolean;
      showAddress: boolean;
      showWorkingHours: boolean;
    };
    copyright: string;
    policies?: {
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
    showTitle?: boolean;
    showSubtitle?: boolean;
    contentHtml?: string;
    bgType?: 'image' | 'video';
    bgColor?: string;
    bgImage?: string;
    bgVideo?: string;
    bgAnimation?: 'zoom-out' | 'slide' | 'fade-slider' | 'zoom-fade-slider' | 'none';
    overlayStartColor?: string;
    overlayStartOpacity?: number;
    overlayEndColor?: string;
    overlayEndOpacity?: number;
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
    facefusionUrl?: string;
  };
  seoSettings?: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    aiAutoEnabled: boolean;
    aiUpdateInterval: number | string;
    lastAnalyzedAt: string | null;
    targetKeywords: string[];
  };
  promoSettings?: {
    mainPromoContent?: string;
    mainPromoEnabled?: boolean;
    subPromoContent?: string;
    subPromoEnabled?: boolean;
    enabled?: boolean;
    platforms?: string[];
    frequency?: string;
    tone?: string;
    credentials?: any;
  };
  partnerSettings?: {
    title?: string;
    subtitle?: string;
    useWhiteBg?: boolean;
    hidden?: boolean;
  };
  partners?: {
    id: string;
    name: string;
    logoImage: string;
    hidden?: boolean;
    linkUrl?: string;
  }[];
  parkingPage?: {
    enabled?: boolean;
    type?: string;
    title: string;
    subtitle: string;
    bgImage?: string;
    bgColor?: string;
    showCountdown?: boolean;
    targetDate?: string;
    collectEmails?: boolean;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: { platform: string; url: string }[];
  };
  popups?: {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    linkText?: string;
    contentHtml?: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
    enabled?: boolean;
    position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    width?: number;
    positionX?: number;
    positionY?: number;
  }[];
  eventPosts?: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    linkUrl?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }[];
  creditSettings?: {
    dailyFreeCredits?: number;
    signupBonusCredits?: number;
    chargeOptionsEnabled?: boolean;
  };
}

export const defaultSiteSettings: SiteSettings = {
  nav: {
    logoType: 'text',
    logoText: 'HAIR_DEAL',
    logoImage: '',
    logoWidth: 'auto',
    logoHeight: '32px',
    primaryBtnText: '무료 체험',
    primaryBtnAction: 'section',
    primaryBtnTarget: 'pricing',
    links: [
      { id: '1', label: '기능', href: '#features' },
      { id: '2', label: 'AI 스튜디오', href: '#ai-demo' },
      { id: '3', label: '요금제', href: '#pricing' }
    ],
    languageSettings: {
      enabled: false,
      availableLanguages: ['ko', 'en', 'ja', 'zh']
    }
  },
  hero: {
    bgType: 'image',
    bgColor: '#111827',
    bgImage: 'https://images.unsplash.com/photo-1521590832167-7bfcbaa6362d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    bgVideo: '',
    bgAnimation: 'zoom-out',
    overlayStartColor: '#000000',
    overlayStartOpacity: 70,
    overlayEndColor: '#000000',
    overlayEndOpacity: 40,
    showBadge: true,
    badgeText: '헤어디자이너를 위한 AI 솔루션',
    title: '당신의 헤어스타일을 \n<span class="gradient-text">완벽하게</span> 보여주세요',
    titleAnimation: 'fade-up',
    subtitle: 'AI 모델 렌덤 생성, 스마트 예약 관리 및 고도화된 고객 CRM 시스템을 제공하는 \n헤어디자이너 필수 플랫폼 헤어딜입니다.',
    subtitleAnimation: 'fade-up',
    primaryBtnBase: '무료 체험 시작하기',
    primaryBtnLink: '#pricing',
    secondaryBtnBase: '상담 문의',
    secondaryBtnLink: '#',
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
    subtitle: '이미 수만 명의 디자이너가 검증한 \'네이버\'의 노하우를 그대로 담았습니다. \n운영은 \'헤어딜\'에 맡기고, 디자이너님은 시술에만 집중하세요.',
    items: [
      { id: '1', hidden: false, icon: 'Shield', title: '초상권 걱정 제로', description: 'AI가 생성한 가상 모델로 초상권 법적 분쟁 없이 자유롭게 \'딸깍\' 한 번으로 SNS 마케팅을 진행' },
      { id: '2', hidden: false, icon: 'Star', title: '신뢰 기반 포트폴리오', description: '나만의 시그니처 스타일을 AI가 학습하여 소비자 기만 분쟁 없이 신뢰 기반 포트폴리오를 즉시 생성' },
      { id: '3', hidden: false, icon: 'TrendingUp', title: '매출 수직 상승', description: '인스타그램 피드, 릴스 홍보 콘텐츠 실시간 업데이트로, 신규 고객 유입률이 평균 300% 이상 증가' },
      { id: '4', hidden: false, icon: 'CheckCircle2', title: 'C2PA 표준 기반 출처 보증', description: '헤어딜 플랫폼에서 생성된 모든 AI 콘텐츠는 국제 C2PA 표준 기준에 따라 출처를 명확하게 표기.' }
    ]
  },
  aiDemo: {
    useWhiteBg: false,
    hidden: false,
    showBadge: true,
    badgeText: 'Hairdeal 2.0 AI Engine',
    title: '"딸깍" 한 번으로 완성되는 \n<span class="gradient-text">압도적인 포트폴리오</span>',
    titleAnimation: 'fade-up',
    subtitle: '시술한 <strong>헤어 스타일은 그대로 보존</strong>하면서, \n원하는 모델의 <strong>얼굴만 자연스럽게 합성</strong>하고, 인스타그램 홍보 글귀까지, \nAI가 자동으로 작성해드립니다.',
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
    subtitle: '숨겨진 비용 없이 숍 규모와 필요에 맞는 최적의 플랜을 선택하세요.\n모든 플랜은 14일 무료 체험이 제공됩니다.',
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
    subtitle: '헤어딜은 모든 미용인들이 오직 시술에만 집중할 수 있도록 \n예약 관리부터 매출 끌어올리는 AI 포트폴리오까지, \n이제 더이상 비싼 마케팅 강의는 듣지 마세요! \n헤어딜 \'딸깍\' 한번이면 개인 브랜딩 마케팅이 해결됩니다. \n더 이상 고민하지 마시고 지금 바로 무료체험을 시작 하세요!',
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
      terms: '...',
      privacy: '...'
    }
  },
  layers: [
    {
      id: "layer_1",
      name: "01 레이어",
      hidden: false,
      anchorId: "",
      title: '지금 바로 헤어딜 <span class="gradient-text">\'딸깍\'</span> 하세요!',
      subtitle: '헤어딜은 모든 미용인들이 오직 시술에만 집중할 수 있도록 \n예약 관리부터 매출 끌어올리는 AI 포트폴리오까지, \n이제 더이상 비싼 마케팅 강의는 듣지 마세요! \n헤어딜 \'딸깍\' 한번이면 개인 브랜딩 마케팅이 해결됩니다. \n더 이상 고민하지 마시고 지금 바로 무료체험을 시작 하세요!',
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
    lastAnalyzedAt: null,
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
    subtitle: '더 나은 서비스를 위해 사이트 점검을 진행하고 있습니다.\n이용에 불편을 드려 죄송합니다.',
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
