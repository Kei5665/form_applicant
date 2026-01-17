export type PeopleImageVariant = 'A' | 'B';

export type FormOrigin = 'coupang' | 'default' | 'mechanic';

export type BirthDate = string;

export type JobTimingOption = 'asap' | 'no_plan' | 'within_3_months' | 'within_6_months' | 'within_1_year';

export type MechanicQualification =
  | 'level3'
  | 'level2'
  | 'level1'
  | 'inspector'
  | 'none';

export type DesiredIncomeOption = '300' | '400' | '500' | '600';

export type FormData = {
  jobIntent: JobTimingOption | '';
  jobTiming: JobTimingOption | '';
  desiredIncome: DesiredIncomeOption | '';
  birthDate: BirthDate;
  fullName: string;
  fullNameKana: string;
  postalCode: string;
  prefectureId: string;
  municipalityId: string;
  phoneNumber: string;
  email: string;
  mechanicQualification: MechanicQualification | '';
};

export type FormErrors = {
  jobIntent?: string;
  jobTiming?: string;
  desiredIncome?: string;
  birthDate?: string;
  fullName?: string;
  fullNameKana?: string;
  postalCode?: string;
  prefectureId?: string;
  municipalityId?: string;
  phoneNumber?: string;
  email?: string;
  mechanicQualification?: string;
};

export type JobCountResult = {
  jobCount: number | null;
  message: string;
  isLoading: boolean;
  error: string;
  searchMethod?: 'postal_code' | 'prefecture';
  searchArea?: string;
  prefectureName?: string;
  prefectureId?: string;
};
