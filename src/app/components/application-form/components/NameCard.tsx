'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import FormCard from './FormCard';
import FingerHint from './FingerHint';
import type { FormErrors } from '../types';
type PrefectureOption = {
  id: string;
  name: string;
};

type MunicipalityOption = {
  id: string;
  name: string;
  prefectureId: string;
};

type NameCardProps = {
  stepImageSrc: string;
  postalCode: string;
  prefectureId: string;
  municipalityId: string;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPrevious: () => void;
  onNext: () => void;
  isActive: boolean;
};

export default function NameCard({ stepImageSrc, postalCode, prefectureId, municipalityId, errors, onChange, onPrevious, onNext, isActive }: NameCardProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [prefectures, setPrefectures] = useState<PrefectureOption[]>([]);
  const [municipalityOptions, setMunicipalityOptions] = useState<MunicipalityOption[]>([]);
  const [isPrefectureLoading, setIsPrefectureLoading] = useState(false);
  const [isMunicipalityLoading, setIsMunicipalityLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPrefectures = async () => {
      setIsPrefectureLoading(true);
      try {
        const response = await fetch('/api/location/prefectures');
        if (!response.ok) {
          throw new Error('Failed to load prefectures');
        }
        const data = await response.json();
        if (mounted) {
          setPrefectures(
            data.contents.map((item: { id: string; region: string }) => ({
              id: item.id,
              name: item.region,
            }))
          );
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setPrefectures([]);
        }
      } finally {
        if (mounted) {
          setIsPrefectureLoading(false);
        }
      }
    };

    loadPrefectures();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!prefectureId) {
      setMunicipalityOptions([]);
      return;
    }

    let mounted = true;

    const loadMunicipalities = async () => {
      setIsMunicipalityLoading(true);
      try {
        const response = await fetch(`/api/location/municipalities?prefectureId=${prefectureId}`);
        if (!response.ok) {
          throw new Error('Failed to load municipalities');
        }
        const data = await response.json();
        if (mounted) {
          setMunicipalityOptions(
            data.contents.map((item: { id: string; name: string; prefectureId: string }) => ({
              id: item.id,
              name: item.name,
              prefectureId: item.prefectureId,
            }))
          );
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setMunicipalityOptions([]);
        }
      } finally {
        if (mounted) {
          setIsMunicipalityLoading(false);
        }
      }
    };

    loadMunicipalities();

    return () => {
      mounted = false;
    };
  }, [prefectureId]);

  const municipalityOptionsFiltered = useMemo(
    () => (prefectureId ? municipalityOptions.filter((item) => item.prefectureId === prefectureId) : municipalityOptions),
    [prefectureId, municipalityOptions]
  );

  const handleToggleFallback = () => {
    setShowFallback((prev) => !prev);
  };

  const isLocationMode = showFallback || !!prefectureId || !!municipalityId;

  const isPostalCodeFilled = postalCode.length === 7;
  const isPrefectureSelected = Boolean(prefectureId);
  const isMunicipalitySelected = Boolean(municipalityId);
  const isNextEnabled = isLocationMode ? isPrefectureSelected && isMunicipalitySelected : isPostalCodeFilled;

  return (
    <FormCard isActive={isActive} className="h-full">
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 3" width={300} height={50} />
      <h1 className="text-lg text-center font-bold mb-4 text-gray-700">条件に合った求人を検索します</h1>
      <div>
        <h3 className="mb-2 text-base font-semibold text-gray-900">お住まいの郵便番号</h3>

        {!isLocationMode && (
          <>
            <label htmlFor="postalCode" className="mb-1 block text-sm text-gray-900">
              半角数字で入力してください
            </label>
              <div className="relative flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d*"
                id="postalCode"
                name="postalCode"
                placeholder="例: 1234567"
                className={`flex-1 rounded-lg border p-3 text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                value={postalCode}
                onChange={onChange}
                maxLength={7}
              />
              <FingerHint isVisible={!isPostalCodeFilled} size={40} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[52px]" />
            </div>
            {errors.postalCode && <p className="mt-2 text-xs text-red-500">{errors.postalCode}</p>}
          </>
        )}

        {isLocationMode && (
          <div className="space-y-4">
            <div>
              <label htmlFor="prefectureId" className="mb-1 block text-gray-900">
                都道府県
              </label>
              <div className="relative flex items-center gap-3">
                <select
                  id="prefectureId"
                  name="prefectureId"
                  className={`flex-1 rounded-lg border p-4 text-gray-900 bg-white ${errors.prefectureId ? 'border-red-500' : 'border-gray-300'}`}
                  value={prefectureId}
                  onChange={onChange}
                  disabled={isPrefectureLoading}
                >
                  <option value="">{isPrefectureLoading ? '読み込み中...' : '都道府県を選択'}</option>
                  {prefectures.map((prefecture) => (
                    <option key={prefecture.id} value={prefecture.id}>
                      {prefecture.name}
                    </option>
                  ))}
                </select>
                <FingerHint isVisible={!isPrefectureSelected} size={40} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[52px]" />
              </div>
              {errors.prefectureId && <p className="mt-2 text-xs text-red-500">{errors.prefectureId}</p>}
            </div>

            <div>
              <label htmlFor="municipalityId" className="mb-1 block text-gray-900">
                市区町村
              </label>
              <div className="relative flex items-center gap-3">
                <select
                  id="municipalityId"
                  name="municipalityId"
                  className={`flex-1 rounded-lg border p-4 text-gray-900 bg-white ${errors.municipalityId ? 'border-red-500' : 'border-gray-300'}`}
                  value={municipalityId}
                  onChange={onChange}
                  disabled={!prefectureId || isMunicipalityLoading}
                >
                  <option value="">{isMunicipalityLoading ? '読み込み中...' : '市区町村を選択'}</option>
                  {municipalityOptionsFiltered.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
                <FingerHint isVisible={!isMunicipalitySelected && Boolean(prefectureId)} size={40} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[52px]" />
              </div>
              {errors.municipalityId && <p className="mt-2 text-xs text-red-500">{errors.municipalityId}</p>}
            </div>
          </div>
        )}

        <button
          type="button"
          className="mt-4 text-sm text-orange-600 underline"
          onClick={handleToggleFallback}
        >
          郵便番号がわからない場合はこちら
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" className="py-2 px-4 font-bold text-gray-800" onClick={onPrevious}>
          ＜ 戻る
        </button>
        <div className="relative flex w-[60%] items-center justify-end gap-2">
          <button type="button" className="flex-1 rounded-md bg-[#ff702a] py-2.5 px-5 font-bold text-white" onClick={onNext}>
            次へ
          </button>
          <FingerHint isVisible={isNextEnabled} size={44} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[56px]" />
        </div>
      </div>
    </FormCard>
  );
}

