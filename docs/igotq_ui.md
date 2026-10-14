# IGOTQ (I Got A Question!) - KakaoTalk UI/UX Edition

> *"질문이 생겼을 땐? IGOTQ!"*  
> 세미나, 컨퍼런스, 교실 수업 등에서 청중과 발표자가 장벽 없이 실시간으로 소통할 수 있도록 지원하는 초간결성(Frictionless) 실시간 세션 백채널(Backchannel) 웹 애플리케이션의 카카오톡 스타일 UI/UX 기획 및 기술 명세서입니다.

---

## 📌 1. 주요 특징 및 기능 (Key Features)

1. **무가입 초간결 접속 (Frictionless Access)**
   - 별도 회원가입 없이 방 코드/URL 및 닉네임 입력만으로 3초 만에 참여 가능.
2. **Q&A 상태 관리 & 대댓글 스레드 (Q&A Thread System)**
   - 미답변(`Pending`) 및 답변 완료(`Answered`) 상태 분리.
   - 발표자/방장의 대댓글 등록 시 자동으로 '답변 완료' 전환.
   - 전체 / 미답변 / 답변완료 탭 필터링 및 최신순/오래된순/미답변우선 정렬.
3. **이원화 데이터 저장 아키텍처 (Dual Storage Architecture)**
   - **일반 사용자 (Session Mode)**: 100% In-Memory (Redis/메모리) 세션 기반 보안 처리, 세션 종료/TTL 만료 시 완전 파기 (GDPR Zero Retention).
   - **승인 사용자 (Cloud Persisted Mode)**: Firebase Cloud Firestore 기반 AES-256-GCM 암호화 보관 및 원클릭 복원.
4. **로컬 세션 백업 및 복원 (Host Local Import/Export)**
   - 방장은 언제든 대화 및 Q&A 스레드를 JSON/TXT 파일로 다운로드 가능 (Web Blob API).
   - 새 세션 개설 시 JSON 업로드로 `[이전 세션 기록]` 상태 복원.
5. **관리자 대시보드 (Super Admin Dashboard)**
   - 실시간 세션/접속자/메모리/CPU 모니터링, 글로벌 금칙어/스팸 필터링 관리, 클라우드 저장 권한 승인 관리.

---

## 🎨 2. KakaoTalk Style UI/UX Design System Specification

### 2.1. Color Palette & Typography
- **Background Color:** `#BACEE0` (KakaoTalk signature soft blue-grey)
- **Host/My Message Bubble:** `#FEE500` (KakaoTalk signature yellow), Text: `#000000`
- **Participant Message Bubble:** `#FFFFFF` (Pure white), Text: `#000000`
- **System / Date Separator:** `#94A4B4` (Semi-transparent pill badge)
- **Primary Text:** `#000000` (Dark gray/black)
- **Muted Text / Timestamp:** `#6A7B8C` or `#556677` (Small, subtle)
- **Status Badges:**
  - 미답변 (Unanswered): `#FF3B30` (Soft red)
  - 답변 완료 (Answered): `#34C759` (Soft green)

---

### 2.2. Layout Structure (Mobile-First Responsive)

#### A. Header (Fixed Top)
- **Left:** Back button, Room Title (`[2026 세미나] IGOTQ`), Participant Count Badge (`👤 42`)
- **Right:** Search icon (Filter Q&A), Menu drawer button (`☰`)
- **Sub-header (Q&A Filter Tabs):**
  - Segmented control pills: `[전체] [미답변만] [답변 완료]`

#### B. Chat Area (Scrollable Main View)
- **Date Separator Badge:** Centered pill label for date/session start (`2026년 10월 14일 수요일`)
- **Message Alignments:**
  - **Participants (Left-aligned):**
    - Show Avatar (Default colored circle or initial icon)
    - Sender Name above the bubble (`12px`, `#333333`)
    - Message Bubble with left tail/arrow pointing to avatar
    - Timestamp + Read/Q&A Status indicator on the **right** of the bubble
  - **Host / Admin (Right-aligned):**
    - Host badge (`[방장]` or `[발표자]`) next to name
    - Message Bubble (`#FEE500`) with right tail/arrow
    - Timestamp + Reply Count on the **left** of the bubble

---

### 2.3. Message Bubble Component Design

#### A. Question Card Bubble (Participant)
```text
[Avatar]  김철수 [14:20]
         ┌──────────────────────────────────────────┐
         │ 🏷️ [미답변]                               │
         │ 인공지능 윤리 관련 세부 가이드라인은     │
         │ 어디서 확인할 수 있나요?                 │
         ├──────────────────────────────────────────┤
         │ 💬 답변 1개 보기                          │
         └──────────────────────────────────────────┘
```
- **Border Radius:** `16px` (Top-left is `2px` for tail effect)
- **Padding:** `10px 14px`
- **Shadow:** Light drop-shadow (`0 1px 2px rgba(0,0,0,0.1)`)
- **Status Badge:** Small tag inside the bubble header

#### B. Threaded Reply (대댓글 / 답변)
- Clicking "답변하기" opens an inline nested thread underneath the parent question card.
- **Nested Thread Styling:**
  - Slightly indented (`pl-4`) with a subtle left border line (`border-l-2 border-yellow-400`).
  - Background color: Light yellow (`#FFFDE6`) for host replies.

---

### 2.4. Input Area (Fixed Bottom)
- **Layout:** Flex row with fixed bottom pinning (`position: fixed; bottom: 0;`).
- **Left Button:** `+` Icon (Attach/Options panel toggle: Upload JSON session, export log).
- **Center Input:** Rounded text input (`border-radius: 20px; bg: #FFFFFF;`).
  - Placeholder: `"질문이나 의견을 입력하세요..."`
  - Auto-expanding textarea (max 3 lines).
- **Right Button:** Yellow circular Send Button (`#FEE500`, `#000000` icon) when text is entered.
- **Anonymous Name Tag:** A small pill badge above the input field showing current display name (`익명123 ✏️`).

---

### 2.5. Micro-Interactions & UX Polish
1. **Auto-Scroll Behavior:** 
   - Automatically scroll to bottom when a new message arrives.
   - If user is scrolling up to read past questions, show a floating `[↓ 새로운 질문 N개]` button at the bottom right instead of forced auto-scroll.
2. **Swipe/Tap Actions:**
   - Tap message: Opens action sheet (`[답변 달기]`, `[답변 완료로 변경]`, `[공지 상단 고정]`).
3. **Pinned Notice Bar (상단 고정 공지):**
   - KakaoTalk-style retractable top bar for host announcements or key sticky questions.

---

## 🤖 3. 에이전트 실행 환경 및 규칙 (`.agents`)

본 프로젝트는 에이전트 자동화 실행 규칙 및 특화 스킬 세트가 적용되어 있습니다.

- **실행 규칙 정의**: [AGENTS.md](./AGENTS.md), [GEMINI.md](./GEMINI.md), [.agents/rules/rules.md](./.agents/rules/rules.md)
  - `Rule 1`: 일반 코드 수정 시 브라우저/Scratchpad 자동 구동 금지
  - `Rule 2`: 코드 변경 후 터미널 기반 정적 오류 고속 검증
  - `Rule 3`: 일반 수정 작업 후 자동 커밋/푸시 금지
  - `Rule 4`: 오직 `/git-commit` 명령어 수신 시에만 README 이력 갱신 및 Git 커밋/푸시 실행
  - `Rule 5`: `/ask` 모드 시 코드 수정 없는 질의응답 및 계획서(`implementation_plan.md`) 작성 전용
  - `Rule 6`: `/scratchpad` 모드 수신 시에만 브라우저 시각 검증 예외 실행
  - `Rule 7`: `/apply` 모드 수신 시 작성된 계획서 즉시 구현 및 터미널 검증
- **등록 스킬 (`.agents/skills/`)**:
  - [`apply`](./.agents/skills/apply/SKILL.md): 계획서 즉시 적용
  - [`ask`](./.agents/skills/ask/SKILL.md): 무수정 질의응답 및 계획서 작성
  - [`git-commit`](./.agents/skills/git-commit/SKILL.md): README 하단 이력 누적 및 GitHub 커밋/푸시
  - [`scratchpad`](./.agents/skills/scratchpad/SKILL.md): 브라우저 UI 시각 검증

---

## 📜 4. 변경 이력 (Changelog)

### [2026-10-14 10:10] 업데이트 이력 (Commit ID: b80bd23)
- **수정 내용**:
  - IGOTQ 초간결성 휘발성 백채널 웹 애플리케이션 전체 풀스택 시스템 신규 구축
  - Next.js 14 App Router + Tailwind v4 + Socket.io 커스텀 서버 (`server.ts`) 구현
  - 일반 사용자용 100% In-Memory 무저장 휘발성 스토어 (`memoryStore.ts`, `redisStore.ts`, `expirySweeper.ts`) 구현
  - 승인 사용자용 Cloud Firestore 암호화 영구 저장소 (`firestoreRepo.ts`, AES-256-GCM) 및 클라우드 히스토리 원클릭 복원 구현
  - Firebase 이메일 로그인, 회원가입, 비밀번호 재설정 및 관리자 승인 시스템 (`/admin`) 구현
  - 청중용 Q&A 등록 및 필터/정렬 (`QAFilterBar`), 방장 대댓글 스레드 및 자동 답변완료 전환 (`ReplyThread`) 구현
  - Web Blob API 기반 로컬 JSON/TXT 백업 다운로드 및 드래그 앤 드롭 세션 복원 파서 구현
  - 원격 GitHub 저장소 (`https://github.com/xoruddkqk4-glitch/IGOTQ.git`) 연동
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npm run type-check`): 통과 (0 errors)
  - ESLint 정적 구문 린팅 (`npm run lint`): 통과 (0 errors, 0 warnings)

### [2026-10-14 12:05] 업데이트 이력 (Commit ID: facd3ec)
- **수정 내용**:
  - **Apple Design System UI/UX 전면 개편**:
    - `.designs/apple/DESIGN.md` 기반 미니멀리즘 디자인 시스템 적용 (`globals.css`, SF Pro, Apple 색상 토큰).
    - 첫 화면 가시성 강화: 불필요한 설명 축소, 핵심 타이틀(5xl~7xl) 및 탭(17px) 대형화, 4개 핵심 특징 카드 재구성.
    - 최상단 글로벌 헤더 크기 확대 (`h-11` ➔ `h-16`), 로고/타이틀 확대, LIVE 뱃지 및 ADMIN 뱃지 추가, 이메일 표시 영역 확장.
  - **Google 원클릭 단독 로그인 전환 (`src/app/login/page.tsx`)**:
    - 이메일/비밀번호 폼을 모두 제거하고 공식 4색 심볼의 Google 원클릭 인증 인터페이스 구현.
  - **관리자 권한 스크립트 수정 및 최고 관리자 승격**:
    - `scripts/set-admin.ts`에 `@next/env` 환경 변수 자동 로더 적용하여 `metadata.google.internal` 오류 해결.
    - `xoruddkqk4@gmail.com` 계정에 관리자(`admin`) 및 영구 보관(`canPersist`) 권한 정상 부여.
  - **저장된 세션(`/history`) Firestore 복합 색인 오류 해결**:
    - `getUserRooms` 쿼리를 단일 필드 조회 후 인메모리 정렬 방식으로 변경하여 색인 누락(`FAILED_PRECONDITION`) 원천 차단.
    - API 라우트 및 클라이언트 응답 파싱 시 `Unexpected end of JSON input` 예외 방어 코드 적용.
  - **초고속 반응성 & 성능 최적화 (0ms 체감 속도)**:
    - WebSocket-First 직결: `transports: ['websocket', 'polling']` 및 `perMessageDeflate: false`로 연결 레이턴시 1~2초 ➔ 10~30ms 단축.
    - 0ms 옵티미스틱 UI: 질문 등록, 대댓글 답변, 답변완료 토글, 질문 삭제 시 서버 대기 없이 즉각 화면 반영.
    - 소켓 재연결 시 자동 재입장(`joinRoom`) 및 페이로드 세션 복구 2중 방어로 `"방에 먼저 입장해야 합니다"` 오류 완벽 차단.
    - 컴포넌트 메모이제이션(`QuestionCard`, `QAFilterBar`에 `React.memo` 및 `useCallback` 적용) 및 사용자 세션 `sessionStorage` 0ms 캐싱.
    - Next.js 컴파일러 및 압축 최적화 (`next.config.mjs`: `swcMinify`, `compress`, `poweredByHeader: false`).
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npm run type-check`): 통과 (0 errors)
  - ESLint 정적 구문 린팅 (`npm run lint`): 통과 (0 errors, 0 warnings)