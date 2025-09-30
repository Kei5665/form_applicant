export type PeopleImageVariant = 'A' | 'B';

export type FormOrigin = 'coupang' | 'default';

export type BirthDate = string;

export type JobTimingOption = 'asap' | 'no_plan';

export type FormData = {
  jobTiming: JobTimingOption | '';
  birthDate: BirthDate;
  fullName: string;
  fullNameKana: string;
  postalCode: string;
  prefectureId: string;
  municipalityId: string;
  phoneNumber: string;
};

export type FormErrors = {
  jobTiming?: string;
  birthDate?: string;
  fullName?: string;
  fullNameKana?: string;
  postalCode?: string;
  prefectureId?: string;
  municipalityId?: string;
  phoneNumber?: string;
};

export type JobCountResult = {
  jobCount: number | null;
  message: string;
  isLoading: boolean;
  error: string;
  searchMethod?: 'postal_code' | 'prefecture';
  searchArea?: string;
  prefectureName?: string;
};

