import type { Metadata } from 'next';
import ApplicationForm from '../components/ApplicationForm';

export const metadata: Metadata = {
  title: 'バス運転手の転職ならライドジョブ｜応募フォーム',
  description:
    '未経験でもわかるドライバー業界の魅力発掘メディア。ライドジョブは仕事のやりがいやリアルな声、キャリアの可能性など、ドライバー業界の魅力を発見・共有する情報発信プラットフォームです。',
};

export default function BusPage() {
  return <ApplicationForm preset="bus" peopleImageSrc="/images/kange2.webp" variant="A" showPeopleImage={false} />;
}
