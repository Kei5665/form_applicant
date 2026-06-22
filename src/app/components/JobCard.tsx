import Image from '@/app/components/AppImage';
import Link from 'next/link';
import type { Job } from '@/lib/microcms';

type JobCardProps = {
  job: Job;
};

export default function JobCard({ job }: JobCardProps) {
  const imageUrl = job.images?.[0]?.url;
  const jobName = job.jobName || '求人名未設定';
  const addressPrefMuni = job.addressPrefMuni || '勤務地未設定';
  const salaryMin = job.salaryMin;
  const salaryMax = job.salaryMax;
  const employmentType = job.employmentType || '雇用形態未設定';
  const jobUrl = `https://ridejob.jp/job/${job.id}`;

  // job.idをシードにして10〜100の範囲で決定的な閲覧数を生成
  const generateViewCount = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 91) + 10; // 10〜100の範囲
  };

  const viewCount = generateViewCount(job.id);

  // 給与の表示形式を整形
  const formatSalary = () => {
    if (!salaryMin && !salaryMax) {
      return '給与応相談';
    }
    if (salaryMin && salaryMax) {
      return `月給 ${salaryMin.toLocaleString()}円 〜 ${salaryMax.toLocaleString()}円`;
    }
    if (salaryMin) {
      return `月給 ${salaryMin.toLocaleString()}円〜`;
    }
    if (salaryMax) {
      return `月給 〜${salaryMax.toLocaleString()}円`;
    }
    return '給与応相談';
  };

  return (
    <Link 
      href={jobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex gap-4 p-4">
        {/* 左側：画像 */}
        <div className="flex-shrink-0 w-24 h-24 relative bg-gray-100 rounded-md overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={jobName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 右側：求人情報 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-gray-900 mb-1 truncate">
            {jobName}
          </h3>
          <p className="text-sm text-gray-600 mb-1 truncate">
            📍 {addressPrefMuni}
          </p>
          <p className="text-sm text-gray-900 font-semibold mb-1">
            💰 {formatSalary()}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              💼 {employmentType}
            </p>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              👀 {viewCount}人が見ました
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

