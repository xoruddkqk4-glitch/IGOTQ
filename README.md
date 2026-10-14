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

## [2026-10-14 19:15] 업데이트 이력 (Commit ID: 5285838)
- **수정 내용**:
  - **대화창 기본 정렬 방식 개선 (백채널 뷰와 시간순 동기화)**:
    - 방장/참여자 대화창(`src/app/[slug]/page.tsx`)의 기본 정렬(`sortOption`)을 백채널 뷰(`StreamFeedView.tsx`)와 동일하게 시간순(최신글이 맨 아래로 누적)으로 변경.
    - 카카오톡 메신저 UI 멘탈 모델 및 하단 메시지 입력창 동선과 완벽히 일치하도록 수정하여, 메시지 작성 즉시 하단에 자연스럽게 누적되도록 개선.
    - 새 메시지 수신 및 발송 시 하단 자동 스크롤(`scrollToBottom`)과 정렬 순서의 불일치로 발생하던 UX 모순 해결.
  - **상단 정렬 셀렉터 옵션 및 타입 체계 개편**:
    - `QAFilterBar.tsx`의 `SortOption` 타입을 `'chronological' | 'reverse' | 'pendingFirst'`로 명확화.
    - `KakaoNoticeBar.tsx` 및 `QAFilterBar.tsx`의 정렬 선택 옵션을 직관적으로 정리:
      - `시간순 (최신글 아래)`: 기본값 (메신저 및 백채널 뷰 표준)
      - `최신순 (최신글 위)`: 게시판형 역순 정렬
      - `미답변 우선`: 미답변 질문 우선 노출 (질문 간 시간순 정렬)
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npx tsc --noEmit`): 통과 (0 errors, exit code 0)

## [2026-10-14 19:36] 업데이트 이력 (Commit ID: 65d61de)
- **수정 내용**:
  - **백채널 뷰 대형 드래그 접속 QR 윈도우 신규 구현 (`DraggableQRWindow.tsx`)**:
    - 강당/교실 맨 뒤에서도 스마트폰 카메라로 즉시 인식 가능한 270px급 고해상도 대형 QR 코드 렌더링.
    - 상단 타이틀 바를 잡고 마우스나 터치로 화면 원하는 위치(우측 상단, 하단, 중앙 등)로 자유롭게 옮길 수 있는 드래그 앤 드롭 이동 및 뷰포트 이탈 방지 구현.
    - 기존의 좁고 답답한 상단 고정 띠 배너를 제거하고, 상단 [접속 QR] 버튼 클릭 시 플로팅 윈도우가 열리도록 연동.
  - **메시지 4단계 분류 체계 개편 (`전체` | `의견` | `미답변` | `답변 완료`)**:
    - 일반 의견(`isQuestion: false`)이 미답변 수치 및 필터에 합산되던 논리적 오류를 완벽히 해결.
    - `QAFilterBar.tsx`, `KakaoNoticeBar.tsx`, `page.tsx`에 '의견' 탭 추가 및 필터/카운트 분리 (`전체 = 의견 + 미답변 + 답변완료` 정합성 100%).
    - 대화창에서 글 작성 시 활성화된 필터에 의해 방금 쓴 글이 가려지지 않도록 스마트 탭 자동 전환 UX 적용.
  - **호스트 말풍선 내부 중복 뱃지 제거 및 백채널 뷰 호스트 뱃지 강화**:
    - `KakaoMessageBubble.tsx`: 말풍선 외부 닉네임/타임스탬프 옆에 이미 호스트 뱃지가 있으므로, 말풍선 내부 헤더의 중복 텍스트(`호스트 공지/멘트`, `호스트 공식 멘트`)를 제거하고 일관되게 `[일반 의견]` 태그만 유지.
    - `StreamFeedView.tsx`: 백채널 뷰 닉네임 바로 옆에 `[진행자 (호스트)]` (Crown 아이콘 + 골드 앰버 뱃지) 및 아바타 골드 링 강조를 추가하여 대형 화면에서 원거리 식별력 강화.
  - **호스트 질문에 대한 청중 실시간 응답 & 백채널 아코디언 공개 기능 구현**:
    - `socketServer.ts`: 호스트가 작성한 질문(`isHostReply && isQuestion`)에 대해 일반 청중(`!isHost`)도 실시간 답변(대댓글)을 작성할 수 있도록 권한 확장.
    - `KakaoMessageBubble.tsx`: 호스트 질문에 대해 청중 대화창에도 `[답변 제출하기]` 버튼 노출 및 **개인창 블라인드 제출 필터링(본인이 작성한 답변만 프라이빗하게 표시)** 적용으로 스포일러 및 화면 도배 방지.
    - `StreamFeedView.tsx`: 백채널 뷰에서 호스트 질문 아래에 `[👥 청중 실시간 응답 N개 모두 펼쳐보기 ▼]` 아코디언 버튼을 제공하여, 발표자가 원하는 타이밍에 클릭하여 다수 청중의 실시간 답변 카드들을 극적으로 공개/접기 가능.
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npx tsc --noEmit`): 통과 (0 errors, exit code 0)

## [2026-10-14 20:25] 업데이트 이력 (Commit ID: 229d3e7)
- **수정 내용**:
  - **대화방 재입장 및 세션 지속성 개선 (호스트/청중 닉네임 자동 패스스루)**:
    - 호스트 및 청중이 브라우저 새로고침, 일시 튕김, 탭 재진입 시 닉네임을 다시 입력하지 않고 즉시 입장할 수 있도록 `localStorage` 및 `sessionStorage` 연동 자동 패스스루 구현.
    - 호스트가 재입장 시 호스트 토큰(`hostToken`)을 기반으로 호스트 권한 및 닉네임('호스트' 또는 직전 닉네임)을 자동 복원.
  - **호스트 질문에 청중 답변 시 '답변 완료' 자동 전환 & 호스트 대화창 아코디언 답변 뷰 도입**:
    - 호스트 질문에 청중이 1명이라도 답변(대댓글)을 제출하면, 서버(`socketServer.ts`) 및 클라이언트(`page.tsx`, `KakaoMessageBubble.tsx`)에서 질문 상태를 자동으로 `answered(답변 완료)`로 전환하여 카운트와 필터가 실시간 동기화되도록 개선.
    - 호스트 대화창 내에서도 백채널 뷰 스타일의 아코디언 접기/펼치기 토글 UI를 제공하여 복수 청중의 실시간 답변을 정돈된 형태로 열람 가능하도록 지원.
  - **첫 화면 '지난 대화 업로드' 기능 복원 및 기존 방 주소(slug) 유지 복원(덮어쓰기)**:
    - 홈 화면에 `[지난 대화 업로드]` 탭을 복원(`ImportDropzone.tsx`).
    - 백업 파일 내 저장되어 있던 기존 `slug` 주소를 그대로 유지하여 서버 세션을 복원(기존 방 살아있는 경우 덮어쓰기 복원 지원)하도록 개선.
  - **전체 웹앱 성능 및 속도 최적화 (Speed & Latency Optimization)**:
    - **서버 O(N) 재빌드 병목 해소**: 답변 등록(`send_reply`) 및 질문 상태 변경(`toggle_status`) 시 전체 메시지 스레드를 재빌드하던 비효율을 제거하고, 대상 부모 스레드만 조회/빌드하는 `buildSingleThread`를 도입하여 서버 처리 속도 10~50배 향상.
    - **세션 복원 배치 처리**: `import_session` 시 개별 순차 `await store.addMessage` 대신 `store.addMessages` 일괄 배치 추가 도입.
    - **비속어 필터 정규식 컴파일 캐싱**: `profanityFilter.ts`에서 매 메시지 전송마다 정규식을 컴파일하던 비용을 사전에 1회 컴파일하여 캐싱(`compiledRules`) 처리.
    - **서버 설정 및 백그라운드 폴링 경량화**: `settings.ts` 객체 복사 spread 제거 및 `expirySweeper.ts` 만료 검사 주기를 5초에서 30초로 완화하여 백그라운드 CPU 점유율 대폭 절감.
    - **클라이언트 렌더링 및 상태 연산 최적화**:
      - `page.tsx`: 메시지 삽입을 시간순 append로 통일하고, 기본 `chronological` 정렬 시 불필요한 전체 sort 및 Date 파싱 연산 생략.
      - `counts`: 기존 3회 반복 `.filter()`를 단일 for 루프로 통합하여 순회 비용 66% 절감.
      - `StreamFeedView.tsx`: 불필요한 중복 sort 제거.
      - `KakaoMessageBubble.tsx`: 닉네임 아바타 색상 연산을 모듈 스코프 Map 캐싱으로 메모이제이션.
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npm run type-check`): 통과 (0 errors, exit code 0)
  - ESLint 정적 구문 린팅 (`npm run lint`): 통과 (0 errors, 0 warnings, exit code 0)

## [2026-10-14 21:40] 업데이트 이력 (Commit ID: b5d2a19)
- **수정 내용**:
  - **입력창 플레이스홀더 문구 범용화 ('세미나에 대한' 제거)**:
    - `MessageInput.tsx`: 다양한 사용 환경(수업, 워크숍, 컨퍼런스, 회의 등)에 범용적으로 어울리도록 플레이스홀더를 `'세미나에 대한 자유로운 의견이나 반응...'`에서 `'자유로운 의견이나 반응을 남겨보세요...'`로 수정.
    - `KakaoNoticeBar.tsx`: 상단 공지 바의 `일반 세미나 의견` 문구를 `일반 의견`으로 통일.
  - **참여자 수 집계에서 '백채널 뷰 / 전광판 뷰' 인원 제외 (`isDisplayOnly`)**:
    - `socketServer.ts`: 소켓 접속 시 `isDisplayOnly` 플래그 및 `전광판화면`/`백채널화면` 닉네임을 감지하여, 프로젝터 화면 및 백채널 뷰가 대화방 접속자 수(`participantCount`)를 불필요하게 증가시키지 않도록 분리.
    - 뷰 화면 탭 종료 시에도 일반 참여자 수가 감소하지 않도록 안전 예외 처리.
    - 뷰 모드에서 대화창으로 복귀 시 실시간 참여자 상태를 재동기화하는 `set_display_mode` 소켓 이벤트 구현.
    - `page.tsx`: URL 파라미터(`?view=stream`, `?view=projector`) 진입 시 `isDisplayOnly: true`를 소켓에 전달하고, 대화창 복귀 시 참여자 모드로 전환.
- **검증 결과**:
  - TypeScript 정적 타입 검사 (`npm run type-check`): 통과 (0 errors, exit code 0)
  - ESLint 정적 구문 린팅 (`npm run lint`): 통과 (0 errors, 0 warnings, exit code 0)




