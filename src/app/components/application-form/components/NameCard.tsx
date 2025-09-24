'use client';

import Image from 'next/image';

import { useEffect, useMemo, useState } from 'react';

import FormCard from './FormCard';
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

  return (
    <FormCard isActive={isActive} className="h-full">
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 3" width={300} height={50} />
      <div>
        <h3 className="mb-2 text-base font-semibold text-gray-900">郵便番号を入力してください</h3>
        <p className="mb-4 text-xs text-gray-500">該当地域の求人件数を確認します</p>

        {!isLocationMode && (
          <>
            <label htmlFor="postalCode" className="mb-1 block text-gray-900">
              郵便番号（ハイフンなし7桁）
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              id="postalCode"
              name="postalCode"
              placeholder="例: 1234567"
              className={`w-full rounded-lg border p-3 text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
              value={postalCode}
              onChange={onChange}
              maxLength={7}
            />
            {errors.postalCode && <p className="mt-2 text-xs text-red-500">{errors.postalCode}</p>}
          </>
        )}

        {isLocationMode && (
          <div className="space-y-4">
            <div>
              <label htmlFor="prefectureId" className="mb-1 block text-gray-900">
                都道府県
              </label>
              <select
                id="prefectureId"
                name="prefectureId"
                className={`w-full rounded-lg border p-3 text-gray-900 bg-white ${errors.prefectureId ? 'border-red-500' : 'border-gray-300'}`}
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
              {errors.prefectureId && <p className="mt-2 text-xs text-red-500">{errors.prefectureId}</p>}
            </div>

            <div>
              <label htmlFor="municipalityId" className="mb-1 block text-gray-900">
                市区町村
              </label>
              <select
                id="municipalityId"
                name="municipalityId"
                className={`w-full rounded-lg border p-3 text-gray-900 bg-white ${errors.municipalityId ? 'border-red-500' : 'border-gray-300'}`}
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
        <button type="button" className="w-[60%] rounded-md bg-[#ff702a] py-2.5 px-5 font-bold text-white" onClick={onNext}>
          次へ
        </button>
      </div>
    </FormCard>
  );
}

