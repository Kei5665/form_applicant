export type FormPreset = 'default' | 'coupang' | 'mechanic';

export interface FormPresetConfig {
  // Visual settings
  headerLogoSrc: string;
  headerUpperText: string;
  headerLowerText: string;
  loadingLogoSrc: string;

  // Step images
  step1ImageSrc: string;
  step2ImageSrc: string;
  step3ImageSrc: string;
  step4ImageSrc?: string;
  step5ImageSrc?: string;

  // Feature flags
  showHeader: boolean;
  showLoadingScreen: boolean;
  showFooterLogo: boolean;
  showBottomImage: boolean;
  enableJobTimingStep: boolean;
  useModal: boolean;

  // Form behavior
  formOrigin: 'default' | 'coupang' | 'mechanic';

  // Styling
  footerBgClassName: string;
  containerClassName: string;

  // Optional images
  footerLogoSrc?: string;
  bottomImageSrc?: string;
}

export const FORM_PRESETS: Record<FormPreset, FormPresetConfig> = {
  default: {
    headerLogoSrc: '/images/ride_logo.svg',
    headerUpperText: '未経験でタクシー会社に就職するなら',
    headerLowerText: 'RIDE JOB（ライドジョブ）',
    loadingLogoSrc: '/images/ride_logo.svg',
    step1ImageSrc: '/images/STEP1.webp',
    step2ImageSrc: '/images/STEP2.webp',
    step3ImageSrc: '/images/STEP3.webp',
    step4ImageSrc: '/images/STEP4.webp',
    step5ImageSrc: '/images/STEP5.webp',
    showHeader: true,
    showLoadingScreen: true,
    showFooterLogo: true,
    showBottomImage: true,
    enableJobTimingStep: true,
    useModal: true,
    formOrigin: 'default',
    footerBgClassName: '',
    containerClassName: '',
  },

  coupang: {
    headerLogoSrc: '/images/ride_logo.svg',
    headerUpperText: 'クーパン求人特設フォーム',
    headerLowerText: 'RIDE JOB × Coupang',
    loadingLogoSrc: '/images/loading_rocket.png',
    step1ImageSrc: '/images/STEP1.webp',
    step2ImageSrc: '/images/STEP2.webp',
    step3ImageSrc: '/images/STEP3.webp',
    step4ImageSrc: '/images/STEP4.webp',
    showHeader: false,
    showLoadingScreen: false,
    showFooterLogo: false,
    showBottomImage: false,
    enableJobTimingStep: false,
    useModal: false,
    formOrigin: 'coupang',
    footerBgClassName: 'bg-[#212e4a]',
    containerClassName: 'pb-8 overflow-hidden',
    footerLogoSrc: '/images/coupang_footer.png',
  },

  mechanic: {
    headerLogoSrc: '/images/mechanic-logo.png',
    headerUpperText: '未経験で整備士に転職するなら',
    headerLowerText: 'ライドジョブ メカニック',
    loadingLogoSrc: '/images/ride_logo.svg',
    step1ImageSrc: '/images/Mechanic-STEP1.webp',
    step2ImageSrc: '/images/Mechanic-STEP2.webp',
    step3ImageSrc: '/images/Mechanic-STEP3.webp',
    step4ImageSrc: '/images/Mechanic-STEP4.webp',
    step5ImageSrc: '/images/Mechanic-STEP5.webp',
    showHeader: true,
    showLoadingScreen: true,
    showFooterLogo: true,
    showBottomImage: true,
    enableJobTimingStep: true,
    useModal: true,
    formOrigin: 'mechanic',
    footerBgClassName: '',
    containerClassName: '',
  },
};
