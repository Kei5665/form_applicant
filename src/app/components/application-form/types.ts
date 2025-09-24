export type PeopleImageVariant = 'A' | 'B';

export type FormOrigin = 'coupang' | 'default';

export type BirthDate = {
  year: string;
  month: string;
  day: string;
};

export type FormData = {
  birthDate: BirthDate;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  postalCode: string;
  prefectureId: string;
  municipalityId: string;
  phoneNumber: string;
};

export type FormErrors = {
  birthDate?: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
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
  searchMethod?: 'postal_code' | 'prefecture' | 'municipality';
  searchArea?: string;
};

