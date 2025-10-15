export type FormPreset = 'default' | 'coupang';

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

  // Feature flags
  showHeader: boolean;
  showLoadingScreen: boolean;
  showFooterLogo: boolean;
  showBottomImage: boolean;
  enableJobTimingStep: boolean;
  useModal: boolean;

  // Form behavior
  formOrigin: 'default' | 'coupang';

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
    step1ImageSrc: '/images/STEP1.png',
    step2ImageSrc: '/images/STEP2.png',
    step3ImageSrc: '/images/STEP3.png',
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
    step1ImageSrc: '/images/STEP1.png',
    step2ImageSrc: '/images/STEP2.png',
    step3ImageSrc: '/images/STEP3.png',
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
};
