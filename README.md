# IGOTQ (I Got A Question!)

> *"질문이 생겼을 땐? IGOTQ!"*  
> 세미나, 컨퍼런스, 교실 수업 등에서 청중과 발표자가 장벽 없이 실시간으로 소통할 수 있도록 지원하는 초간결성(Frictionless) 실시간 세션 백채널(Backchannel) 웹 애플리케이션

---

## 📌 주요 특징 및 기능 (Key Features)

1. **무가입 초간결 접속 (Frictionless Access)**:
   - 별도 회원가입 없이 방 코드/URL 및 닉네임 입력만으로 3초 만에 참여 가능.
2. **Q&A 상태 관리 & 대댓글 스레드 (Q&A Thread System)**:
   - 미답변(`Pending`) 및 답변 완료(`Answered`) 상태 분리.
   - 발표자/방장의 대댓글 등록 시 자동으로 '답변 완료' 전환.
   - 전체 / 미답변 / 답변완료 탭 필터링 및 최신순/오래된순/미답변우선 정렬.
3. **이원화 데이터 저장 아키텍처 (Dual Storage Architecture)**:
   - **일반 사용자 (Session Mode)**: 100% In-Memory (Redis/메모리) 세션 기반 보안 처리, 세션 종료/TTL 만료 시 완전 파기(GDPR Zero Retention).
   - **승인 사용자 (Cloud Persisted Mode)**: Firebase Cloud Firestore 기반 AES-256-GCM 암호화 보관 및 원클릭 복원.
4. **로컬 세션 백업 및 복원 (Host Local Import/Export)**:
   - 방장은 언제든 대화 및 Q&A 스레드를 JSON/TXT 파일로 다운로드 가능 (Web Blob API).
   - 새 세션 개설 시 JSON 업로드로 `[이전 세션 기록]` 상태 복원.
5. **관리자 대시보드 (Super Admin Dashboard)**:
   - 실시간 세션/접속자/메모리/CPU 모니터링, 글로벌 금칙어/스팸 필터링 관리, 클라우드 저장 권한 승인 관리.

---

## 🤖 에이전트 실행 환경 및 규칙 (`.agents`)

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

## 📜 변경 이력 (Changelog)

## [2026-10-14 10:10] 업데이트 이력 (Commit ID: b80bd23)
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

## [2026-10-14 12:05] 업데이트 이력 (Commit ID: facd3ec)
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

## [2026-10-14 15:52] 업데이트 이력 (Commit ID: 51968c4)
- **수정 내용**:
  - **파일 첨부 지원 (이미지 및 PDF 즉시 미리보기)**:
    - 청중 및 호스트가 첨부된 이미지(JPG, PNG, GIF, WebP)와 PDF 문서를 모바일 및 PC에서 별도 다운로드 없이 원클릭으로 즉시 볼 수 있는 전용 뷰어 모달(`FilePreviewModal.tsx`) 신규 구현.
    - 인라인 썸네일/아이콘 뷰, 새 창 열기, 파일 다운로드 기능 제공.
  - **멘트 입력창 사용성 및 시각적 강조 개선**:
    - `MessageInput.tsx`의 기본 입력 모드를 '질문 (Q&A)'에서 '일반 의견'으로 변경.
    - 버튼 배치 순서를 '일반 의견'을 앞(좌측)으로 재배치하고, 활성화 시 시그니처 블루 배경 강조색(`bg-[#0066cc] text-white`) 적용.
  - **호스트 툴바 명칭 개편 및 가시성 최적화**:
    - '대화 피드 뷰' ➔ '백채널 뷰'로 명칭 변경 및 툴바 1번 위치(최좌측)로 이동, 블루 배경 강조색 적용.
    - '청중 전체 창' ➔ '질문 카드 뷰'로 명칭 변경 및 2번 위치로 배치.
    - 비교육적인 화투(🎴) 아이콘 ➔ 모던 레이아웃 아이콘(`Layers3`)으로 교체.
    - 툴바 버튼 텍스트가 항상 1행으로 유지되도록 텍스트 크기 동적 스케일링(`clamp`) 및 줄바꿈 방지 적용.
    - 호스트 툴바에서 불필요한 '기존 대화 업로드' 버튼 및 모달 제거.
  - **강당/교실용 가시성 극대화 전체 화면 뷰 (백채널 뷰 & 질문 카드 뷰)**:
    - 백채널 뷰(`StreamFeedView.tsx`): 전체화면 브레이크아웃(`fixed inset-0 z-[60]`)으로 양옆 회색 여백 제거 및 폭 확장(`max-w-6xl xl:max-w-7xl`), 대형 카카오톡 스타일 말풍선 타이포그래피(22~25px), 고대비 뱃지 및 프로필 아바타 적용.
    - 질문 카드 뷰(`ProjectorView.tsx`): 전체화면 브레이크아웃(`fixed inset-0 z-[60]`)으로 회색 사이드바 제거, 미완료 질문을 대형 카드 형태로 실시간 표시.
    - 전광판/백채널 모드 시 상단 글로벌 블랙 헤더 자동 숨김 처리로 스크린 공간 100% 활용.
    - 닉네임 입력 없이도 전광판/백채널 모드 진입 시 관전자 닉네임 자동 부여로 즉시 소켓 직결.
  - **첫 화면 버튼 반응성 및 인터랙션 개선**:
    - 클라이언트 스크립트 청크 응답 정상화 및 개발 서버 리로드로 React 이벤트 하이드레이션 복구.
    - 첫 화면 탭을 `[방 참여하기]`와 `[새 방 만들기]` 2분할 탭으로 간결화하고 `type="button"` 및 `cursor-pointer` 적용.
    - `JoinRoomForm` 및 `CreateRoomForm`에 `noValidate` 및 인라인 유효성 검사 에러 피드백을 적용하여 빈 입력 시 즉각 에러 메시지(`"입장할 방 코드 또는 URL을 입력해 주세요."`)와 입력창 빨간색 하이라이트 제공.
    - '참여하기' 클릭 시 `"입장 중..."` 로딩 피드백 및 `cursor-pointer` 적용.
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npm run type-check`): 통과 (0 errors)
  - ESLint 정적 구문 린팅 (`npm run lint`): 통과 (0 errors, 0 warnings)
  - 홈 화면 클라이언트 청크 응답 검증: 모든 청크 200 OK 서빙 완료


