# 🌸 따뜻한 하루 일기 & AI 응원 웹앱

오늘의 감정과 하루를 기록하고, Google Gemini AI 비서 '마음이'로부터 다정한 위로와 내일을 위한 긍정 행동 1가지를 제안받는 감성 다이어리 웹앱입니다.

---

## 🚀 GitHub 업로드 및 Vercel 배포 가이드

### 1단계: GitHub에 소스코드 올리기

1. **GitHub에서 새 저장소(Repository) 생성**
   - [GitHub](https://github.com)에 로그인 후 우측 상단 **`+`** → **`New repository`** 클릭
   - 저장소 이름(예: `warm-daily-diary`) 입력 후 **`Create repository`** 클릭 (README 추가 체크 해제)

2. **로컬 프로젝트 터미널에서 Git 초기화 및 푸시**
   프로젝트 폴더에서 아래 명령어들을 차례대로 실행합니다:

   ```bash
   # 1. Git 저장소 초기화
   git init

   # 2. 모든 파일 스테이징 (.env는 .gitignore에 의해 자동 제외됩니다)
   git add .

   # 3. 커밋 생성
   git commit -m "feat: 따뜻한 하루 일기 & AI 응원 웹앱 초기 구성"

   # 4. 기본 브랜치를 main으로 설정
   git branch -M main

   # 5. 본인의 깃허브 저장소 주소 연결 (본인 URL로 변경)
   git remote add origin https://github.com/<본인-깃허브-아이디>/<저장소-이름>.git

   # 6. 깃허브로 업로드
   git push -u origin main
   ```

---

### 2단계: Vercel에서 배포하기

1. [Vercel](https://vercel.com)에 접속하여 로그인합니다. (GitHub 계정으로 로그인 권장)
2. 대시보드 우측 상단의 **`Add New...`** → **`Project`**를 클릭합니다.
3. 방금 올린 GitHub 저장소를 찾아 **`Import`** 버튼을 누릅니다.
4. **Project Settings**:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `vite build` (기본값)
   - **Output Directory**: `dist` (기본값)

---

### 3단계: 환경 변수(Environment Variables) 설정 (중요 🔑)

배포 화면의 **Environment Variables** 섹션을 펼치고 아래 환경 변수를 추가합니다:

| Key (이름) | Value (값) | 설명 |
| :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | `AIzaSy...본인의-API-키` | Vercel 서버리스 함수(`/api/gemini/warm-reply`)에서 사용할 Google Gemini API 키 (필수) |

> 💡 **참고**:
> 클라이언트 사이드 직접 호출을 원할 경우 `VITE_GEMINI_API_KEY`도 동일하게 추가할 수 있으나, 보안을 위해 서버리스 환경 변수인 `GEMINI_API_KEY`를 등록하시는 것을 권장합니다.

5. 설정을 마친 후 **`Deploy`** 버튼을 클릭합니다.
6. 1~2분 후 배포가 완료되면 발급된 도메인(`https://<프로젝트이름>.vercel.app`)으로 바로 접속할 수 있습니다!

---

## 🛠 기술 스택 및 구조

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **AI Engine**: Google Gemini API (`@google/genai`, `gemini-3.1-flash-lite`, `gemini-3.8-flash`)
- **Backend / Serverless**: Vercel Serverless Function (`/api/gemini/warm-reply.ts`) & Express (`server.ts`)
- **Database**: Firebase Firestore (`agagag-56118`) + LocalStorage Dual-Sync

---

## 🔒 보안 사항
- API 키는 절대 프론트엔드 코드에 하드코딩되지 않으며, 환경 변수를 통해 안전하게 관리됩니다.
- `.gitignore`에 `.env*`가 등록되어 있어 API 키가 GitHub에 공개되지 않도록 보호되어 있습니다.
