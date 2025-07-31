# Job Information API Schema (microCMS)
Generated 2025-07-29 03:56 (JST)

## Authentication & Base URL

| Variable | Purpose |
|----------|---------|
| `MICROCMS_SERVICE_DOMAIN` | microCMS service domain (before `.microcms.io`). |
| `MICROCMS_API_KEY` | API key with read permission. |

```bash
BASE_URL="https://$MICROCMS_SERVICE_DOMAIN.microcms.io/api/v1"
```

### cURL Example
```bash
curl -H "X-MICROCMS-API-KEY: $MICROCMS_API_KEY" \
     "$BASE_URL/jobs?limit=10"
```

## Endpoints & Field Definitions

### `jobs` Collection

| Field ID | Name (JP) | Kind | Required | Notes |
| --- | --- | --- | --- | --- |
| title | タイトル | textArea |  |  |
| prefecture | 都道府県 | relation |  |  |
| municipality | 市区町村 | relation |  |  |
| tags | タグ | relationList |  |  |
| jobCategory | 職種カテゴリー | relation |  |  |
| companyName | 会社名 | text |  |  |
| jobName | 職種名 | text |  |  |
| catchCopy | 求人キャッチコピー | text |  |  |
| addressZip | 勤務地（郵便番号） | text |  |  |
| addressPrefMuni | 勤務地（都道府県・市区町村・町域） | text |  |  |
| addressLine | 勤務地（丁目・番地・号） | text |  |  |
| addressBuilding | 勤務地（建物名・階数） | text |  |  |
| employmentType | 雇用形態 | select |  |  |
| wageType | 給与形態 | select |  |  |
| salaryMin | 給与（最低額） | number |  |  |
| salaryMax | 給与（最高額） | number |  |  |
| workStyle | 勤務形態 | text |  |  |
| avgScheduledHours | 平均所定労働時間 | number |  |  |
| socialInsurance | 社会保険 | text |  |  |
| ssReason | 社会保険（適用されない理由） | textArea |  |  |
| descriptionWork | 募集要項（仕事内容） | textArea |  |  |
| descriptionAppeal | 募集要項（アピールポイント） | textArea |  |  |
| descriptionPerson | 募集要項（求める人材） | textArea |  |  |
| workHours | 募集要項（勤務時間・曜日） | textArea |  |  |
| holidays | 募集要項（休暇・休日） | textArea |  |  |
| dlNote | 募集要項（勤務地の補足） | textArea |  |  |
| access | 募集要項（アクセス） | textArea |  |  |
| salaryNote | 募集要項（給与の補足） | textArea |  |  |
| descriptionBenefits | 募集要項（待遇・福利厚生） | textArea |  |  |
| descriptionOther | 募集要項（その他） | textArea |  |  |
| images | 掲載画像 | mediaList |  |  |
| hasResume | 履歴書の有無 | select |  |  |
| applyEmail | 応用メールアドレス | text |  |  |
| inquiryTel | 求人問い合わせ先電話番号 | text |  |  |
| matchingKeywords | マッチングキーワード | textArea |  |  |
| recurteId | 求人ID（編集不可） | text |  |  |

### `jobcategories` Collection

| Field ID | Name (JP) | Kind | Required | Notes |
| --- | --- | --- | --- | --- |
| name | 職種名 | text |  |  |
| category | 職種カテゴリ | select |  |  |

### `prefectures` Collection

| Field ID | Name (JP) | Kind | Required | Notes |
| --- | --- | --- | --- | --- |
| region | 都道府県名 | text |  |  |
| area | 地方 | text |  |  |

### `municipalities` Collection

| Field ID | Name (JP) | Kind | Required | Notes |
| --- | --- | --- | --- | --- |
| name | 表示名 | text |  |  |
| prefecture | 都道府県 | relation |  |  |

### `tag` Collection

| Field ID | Name (JP) | Kind | Required | Notes |
| --- | --- | --- | --- | --- |
| name | タグ名 | text |  |  |
| category | カテゴリ | text |  |  |
