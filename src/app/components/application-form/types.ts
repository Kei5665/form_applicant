export type PeopleImageVariant = 'A' | 'B';

export type FormOrigin = 'coupang' | 'default' | 'mechanic';

export type BirthDate = string;

export type JobTimingOption = 'asap' | 'no_plan';

export type MechanicQualification =
  | 'none'
  | 'level3'
  | 'level2'
  | 'level1'
  | 'inspector'
  | 'body_paint';

export type FormData = {
  jobTiming: JobTimingOption | '';
  birthDate: BirthDate;
  fullName: string;
  fullNameKana: string;
  postalCode: string;
  prefectureId: string;
  municipalityId: string;
  phoneNumber: string;
  email: string;
  mechanicQualifications: MechanicQualification[];
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
  email?: string;
  mechanicQualifications?: string;
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

