# IGOTQ (I Got A Question!)

> *"질문이 생겼을 땐? IGOTQ!"*  
> 세미나, 컨퍼런스, 교실 수업 등에서 청중과 발표자가 장벽 없이 실시간으로 소통할 수 있도록 지원하는 초간결성(Frictionless) 휘발성 백채널(Backchannel) 웹 애플리케이션

---

## 📌 주요 특징 및 기능 (Key Features)

1. **무가입 초간결 접속 (Frictionless Access)**:
   - 별도 회원가입 없이 방 코드/URL 및 닉네임 입력만으로 3초 만에 참여 가능.
2. **Q&A 상태 관리 & 대댓글 스레드 (Q&A Thread System)**:
   - 미답변(`Pending`) 및 답변 완료(`Answered`) 상태 분리.
   - 발표자/방장의 대댓글 등록 시 자동으로 '답변 완료' 전환.
   - 전체 / 미답변 / 답변완료 탭 필터링 및 최신순/오래된순/미답변우선 정렬.
3. **이원화 데이터 저장 아키텍처 (Dual Storage Architecture)**:
   - **일반 사용자 (Volatile Mode)**: 100% In-Memory (Redis/메모리) 휘발성 처리, 세션 종료/TTL 만료 시 완전 파기(GDPR Zero Retention).
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
