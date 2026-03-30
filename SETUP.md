# 빵맵 정식 앱 설정 가이드

## 1단계: Supabase 설정 (인증 + DB)

### 1-1. Supabase 프로젝트 생성
1. https://supabase.com 접속 → GitHub로 로그인
2. **New Project** 클릭
3. 프로젝트 이름: `bbangmap` / 지역: `Northeast Asia (Seoul)` / DB 비밀번호 설정
4. 생성 완료 (약 2분 소요)

### 1-2. API 키 복사
- Settings → API
- `Project URL` → VITE_SUPABASE_URL
- `anon public` 키 → VITE_SUPABASE_ANON_KEY

### 1-3. 데이터베이스 스키마 생성
- 좌측 메뉴 → **SQL Editor** → New Query
- `supabase/schema.sql` 파일 전체 복사 → 붙여넣기 → Run

### 1-4. 소셜 로그인 설정
- Authentication → Providers
- **Google**: Client ID + Client Secret (Google Cloud Console에서 발급)
- **Kakao**: Kakao Developers에서 REST API 키 발급
- Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

---

## 2단계: 네이버 API 설정 (전국 빵집 검색)

1. https://developers.naver.com → 로그인
2. **Application 등록** → 앱 이름: `빵맵`
3. 사용 API: **지역검색**, **이미지검색** 체크
4. 서비스 URL: 배포 도메인 입력
5. Client ID + Client Secret 복사

---

## 3단계: .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_NAVER_CLIENT_ID=abc123
VITE_NAVER_CLIENT_SECRET=xyz456
VITE_ADSENSE_CLIENT_ID=ca-pub-123456789
```

---

## 4단계: Google AdSense 설정 (광고 수익)

1. https://adsense.google.com 가입 (도메인 소유 확인 필요)
2. 사이트 승인 완료 후 광고 단위 생성
3. `index.html` 내 AdSense `<script>` 주석 해제 후 실제 ID 입력
4. `VITE_ADSENSE_CLIENT_ID` 환경변수에 `ca-pub-XXXXXXX` 입력

---

## 5단계: Vercel 배포

### 방법 A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 방법 B: GitHub 연동 (추천)
1. GitHub에 레포지토리 push
2. https://vercel.com → New Project → GitHub 연동
3. **Environment Variables** 탭에서 .env 내용 모두 입력
4. Deploy 클릭 → 자동 배포 완료

### 배포 후 설정
- Supabase → Authentication → URL Configuration
  - Site URL: `https://your-app.vercel.app`
  - Redirect URLs에 Vercel 도메인 추가

---

## 6단계: 도메인 연결 (선택)

- Vercel → Settings → Domains → `bbangmap.co.kr` 등록
- 도메인 DNS A레코드 → Vercel IP로 변경

---

## 현재 데모 → 정식 전환 체크리스트

- [ ] .env 파일 생성 및 Supabase 키 입력
- [ ] supabase/schema.sql 실행
- [ ] Google OAuth 설정
- [ ] Kakao OAuth 설정
- [ ] 네이버 API 키 입력
- [ ] Vercel 배포
- [ ] Google AdSense 승인 후 광고 활성화
- [ ] 도메인 연결

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Vite |
| 인증/DB | Supabase (PostgreSQL + Auth) |
| 지도 | Leaflet + OpenStreetMap |
| 검색 API | 네이버 지역검색 API |
| 광고 | Google AdSense |
| 배포 | Vercel |
| 폰트 | Noto Sans KR |
