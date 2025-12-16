'use client';

export default function CoupangSeminarDetails() {
  return (
    <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">セミナー詳細</h2>

      <div className="space-y-6 text-sm">
        {/* 開催日程 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            開催日程（全日程オンライン開催となります※ZOOM）
          </h3>
          <p className="text-gray-700 ml-4">スクロールいただき、ご確認ください。</p>
        </div>

        {/* 開催方法 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            開催方法
          </h3>
          <div className="text-gray-700 ml-4 space-y-1">
            <p>オンライン（Zoom）</p>
            <p className="text-xs">※Zoom URLについては、セミナー開催日当日の午前までにお送りいたします。ご確認お願い致します。</p>
          </div>
        </div>

        {/* 内容 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            内容（所要時間：30～60分）
          </h3>
          <div className="text-gray-700 ml-4 space-y-2">
            <div>
              <p className="font-semibold">・会社および職務説明（約20～30分）</p>
              <p className="text-xs pl-2">⇒ロケットナウの事業概要や募集職種の仕事内容についてご説明します。</p>
            </div>
            <div>
              <p className="font-semibold">・面接（約5分）</p>
              <p className="text-xs pl-2">⇒オンライン面接形式で実施します。</p>
              <p className="text-xs pl-2">※当日は「電話番号下4桁」「簡単な自己紹介」「職種の志望理由」をご準備のうえ、ご参加くださいませ。</p>
            </div>
          </div>
        </div>

        {/* セミナー参加方法 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            セミナー参加方法
          </h3>
          <p className="text-gray-700 ml-4">お申し込み時にご登録いただいたメールアドレス宛に、セミナー当日の午前までにZoomリンクと参加方法のご案内をお送りします。</p>
        </div>

        {/* セミナー参加資格 */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            セミナー参加資格
          </h3>
          <div className="text-gray-700 ml-4 space-y-1">
            <p>・日本国籍を保有している、もしくは日本で就労可能な方が対象です。※永住権保有かつN1資格取得者</p>
            <p>・採用セミナーは原則として1回のみ参加が可能です。繰り返しの参加はご遠慮いただいております。</p>
            <p>・過去にCP ONE JAPANで勤務された、もしくは過去説明会に参加された方は、今回の採用セミナーの対象外となります。</p>
            <p>・面接時の服装はスーツもしくはオフィスカジュアルでお願いします。※スーツ推奨</p>
            <p>・年齢上限は、40歳までとなります。</p>
            <p>・5分前には入室いただき待機をお願い致します。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

