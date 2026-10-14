# IGOTQ (I Got A Question!) 구현 상세 계획서 (Implementation Plan)

- **최초 작성**: 2026-10-14 09:20 (KST)
- **최종 수정**: 2026-10-14 09:42 (KST)
- **문서 버전**: v1.1
- **기반 사양서**: [technical_specification_prompt.md](./technical_specification_prompt.md)
- **저장 위치**: `docs/implementation_plan_20261014_0920.md`

---

## 0. v1.1 주요 결정 사항

| 항목 | 결정 | 사양서 대비 |
| :--- | :--- | :--- |
| 영구 저장소 / 인증 | **Firebase** (Cloud Firestore + Firebase Authentication) | 사양서의 PostgreSQL(Supabase)을 **대체** |
| 로그인 방식 | **이메일 로그인** (이메일/비밀번호 + 이메일 인증) | 사양서 "이메일 또는 API Key" 중 이메일 채택 |
| 스타일링 | **Tailwind CSS v4** (CSS-first 설정) | 사양서 Tailwind CSS 유지, v4로 확정 |
| 프레임워크 | **Next.js (App Router) 단일 확정** | Vite 옵션 제거 |
| 일반(익명) 방 | **자체 Node 서버 + Socket.io + Redis/메모리** | 사양서 Zero Data Retention 그대로 준수 |

### 0.1 하이브리드 아키텍처를 택한 이유
- Firebase(Firestore/RTDB)로 실시간 동기화를 하면 **익명 메시지가 Google 서버 DB에 기록**됩니다. 사양서의 "일반 사용자 서버 측 저장 데이터 없음" 원칙과 충돌합니다.
- 따라서 **익명 방은 자체 서버 메모리(Redis)에서만** 처리하고, Firebase는 아래 역할만 맡습니다.
  1. **Authentication**: 관리자, 승인 사용자(호스트)의 이메일 로그인
  2. **Firestore**: 승인 사용자 방의 **암호화 영구 저장**, 사용자 승인 정보, 시스템 설정, 금칙어
- Firestore 접근은 **모두 서버(Admin SDK)를 거칩니다.** 클라이언트는 Firebase Auth SDK만 사용하고 Firestore에 직접 접근하지 않습니다(보안 규칙으로 전면 차단).
  - 그래서 Firestore의 "청중 수만큼 읽기 과금" 문제가 생기지 않습니다.
  - Cloud Functions(유료 Blaze 플랜)도 필요 없습니다.

> [!NOTE]
> 익명 방 데이터를 Firestore/RTDB에 잠시 저장해도 된다면, Socket.io/Redis 없이 **Firebase만으로 서버 없이 구현**하는 방식도 가능합니다. 이 경우 Zero Data Retention 문구와 관리자 CPU/메모리 모니터링 요구사항은 포기해야 합니다.

---

## 1. 프로젝트 개요 및 핵심 목표

### 1.1 서비스 개요
**IGOTQ (I Got A Question!)**는 컨퍼런스, 세미나, 교실 수업 등에서 청중과 발표자 간의 장벽을 없애고 3초 만에 참여할 수 있는 **초간결성(Frictionless) 실시간 세션 백채널(Backchannel) 웹 애플리케이션**입니다.

### 1.2 핵심 가치 및 차별화 요소
1. **Frictionless 접속**: 청중은 회원가입 없이 URL/방 코드 + 닉네임만으로 즉시 참여.
2. **Q&A 상태 및 대댓글 스레드**: `미답변 (Pending)` ➔ `답변 완료 (Answered)` 자동 전환, 필터와 정렬 지원.
3. **이원화 데이터 저장 모델**:
   - 일반 방: **100% In-Memory (Redis / 메모리 폴백)**, TTL 만료 시 즉시 완전 삭제 (Zero Retention).
   - 승인 사용자 방: **Firestore에 AES-256-GCM 암호화 저장** + 서버 메모리 캐시, 설정 수명 경과 시 삭제.
4. **호스트 로컬 세션 백업 & 복원**: **언제든지** `.json` / `.txt` 다운로드(Web Blob API), 방 개설 시 또는 방 안에서 JSON 업로드로 `[이전 세션 기록]` 복원.
5. **슈퍼 어드민 대시보드**: 활성 방 수, 동시 접속자, **서버 메모리/CPU** 모니터링, 금칙어/스팸 관리, **기본 TTL**과 최대 글자 수 설정, 클라우드 저장 권한 승인, 클라우드 세션 복원.

---

## 2. 기술 스택 및 패키지 정의

### 2.1 구성 요소

| 영역 | 기술 | 역할 |
| :--- | :--- | :--- |
| Framework | Next.js (App Router) + React + TypeScript | 화면, 보조 REST API |
| Styling | **Tailwind CSS v4** + `@tailwindcss/postcss` | `globals.css`의 `@theme` 토큰으로 디자인 시스템 정의 (`tailwind.config` 불필요) |
| Icons | `lucide-react` | 아이콘 |
| Realtime | `socket.io` / `socket.io-client` | 100ms 미만 실시간 브로드캐스트 |
| Scale-out | `@socket.io/redis-adapter` | 다중 인스턴스 시 Redis Pub/Sub 연동 (`REDIS_URL` 있을 때만) |
| Volatile Store | `ioredis` + 메모리 폴백 | 일반 방 메시지, 접속자, 만료 관리 |
| Auth (클라이언트) | `firebase` (Auth 모듈만 사용) | 이메일 로그인, 가입, 인증 메일, 비밀번호 재설정 |
| Server SDK | `firebase-admin` | ID 토큰 검증, Custom Claims, Firestore 읽기/쓰기 |
| 암호화 | Node `crypto` (AES-256-GCM) | 영구 저장 메시지의 닉네임/본문 암호화 |
| 검증 | `zod` | 소켓 페이로드, API 요청, JSON Import 스키마 검증 |
| 서버 실행 | `tsx`, `cross-env` | `server.ts` 직접 실행, Windows 호환 환경변수 |
| 정적 검증 | `typescript`, `eslint`, `eslint-config-next` | Rule 2 터미널 검증 |

### 2.2 `package.json` 명세

```json
{
  "name": "igotq",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "next build",
    "start": "cross-env NODE_ENV=production tsx server.ts",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "set-admin": "tsx scripts/set-admin.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "firebase": "^11.0.0",
    "firebase-admin": "^13.0.0",
    "socket.io": "^4.8.0",
    "socket.io-client": "^4.8.0",
    "@socket.io/redis-adapter": "^8.3.0",
    "ioredis": "^5.4.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.19.0",
    "cross-env": "^7.0.3",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

> [!NOTE]
> 버전은 최소 기준입니다. `/apply` 시 `npm install`로 서로 호환되는 최신 안정 버전을 설치하고 `package-lock.json`으로 고정합니다. `tailwind-merge` v3는 Tailwind v4 전용입니다.

### 2.3 Tailwind v4 설정 방식
- `postcss.config.mjs`: `plugins: { "@tailwindcss/postcss": {} }`
- `src/app/globals.css`:
  - `@import "tailwindcss";`
  - `@theme { --color-brand-*, --font-sans, --radius-*, ... }`로 다크 테마, 글래스모피즘 토큰 정의
- `autoprefixer`는 v4에 내장되어 있어 설치하지 않습니다.

### 2.4 환경 변수 (`.env.example`)

```bash
# Firebase 클라이언트 (공개 가능)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (서버 전용, 절대 커밋 금지)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# 영구 저장 암호화 키 (32바이트 base64)
ENCRYPTION_KEY=

# 선택: 없으면 메모리 폴백 사용
REDIS_URL=

PORT=3000
```

---

## 3. 상세 디렉토리 구조

```text
08-IGOTQ/
├── .agents/                          # 에이전트 규칙 및 스킬 (기존)
├── .env.example                      # 환경 변수 템플릿
├── .gitignore
├── .firebaserc                       # Firebase 프로젝트 연결
├── AGENTS.md / GEMINI.md / README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs                # @tailwindcss/postcss
├── eslint.config.mjs                 # Flat config + eslint-config-next
├── server.ts                         # Next.js + Socket.io 통합 커스텀 서버 (tsx 실행)
├── firebase.json                     # Firestore 규칙/인덱스 배포 설정
├── firestore.rules                   # 클라이언트 직접 접근 전면 차단
├── firestore.indexes.json            # 복합 인덱스
├── scripts/
│   └── set-admin.ts                  # 관리자 Custom Claim 부여 스크립트
├── docs/
│   ├── technical_specification_prompt.md
│   └── implementation_plan_20261014_0920.md
└── src/
    ├── app/
    │   ├── layout.tsx                # 루트 레이아웃, 폰트, AuthProvider
    │   ├── globals.css               # @import "tailwindcss" + @theme 토큰
    │   ├── page.tsx                  # 홈: 방 생성 / 방 코드 참여
    │   ├── login/page.tsx            # 이메일 로그인, 가입, 비밀번호 재설정
    │   ├── history/page.tsx          # 승인 사용자 클라우드 세션 히스토리
    │   ├── admin/page.tsx            # 슈퍼 어드민 대시보드
    │   ├── [slug]/page.tsx           # 실시간 Q&A 방
    │   └── api/
    │       ├── me/route.ts           # 로그인 사용자 프로필 조회/생성
    │       ├── rooms/route.ts        # POST 방 생성 (hostToken 발급)
    │       ├── rooms/[slug]/route.ts # GET 방 메타 정보
    │       ├── history/route.ts      # GET 내 클라우드 세션 목록
    │       ├── history/[roomId]/restore/route.ts  # POST 원클릭 복원
    │       └── admin/
    │           ├── stats/route.ts    # 방/접속자/메모리/CPU 스냅샷
    │           ├── settings/route.ts # 기본 TTL, 최대 글자 수, 레이트 리밋
    │           ├── profanity/route.ts
    │           ├── users/route.ts    # 사용자 목록, 저장 권한 부여/철회
    │           └── rooms/route.ts    # 클라우드 방 목록, 복원
    ├── components/
    │   ├── common/                   # Header, Modal, Toast, Badge, AuthGuard
    │   ├── auth/                     # AuthProvider, EmailLoginForm, SignUpForm, ResetPasswordForm
    │   ├── home/                     # CreateRoomForm, JoinRoomForm, ImportDropzone, CloudConsent
    │   ├── room/
    │   │   ├── NicknameGate.tsx      # 입장 시 닉네임 입력
    │   │   ├── RoomHeader.tsx        # 제목, 접속자 수, 남은 시간, URL 공유
    │   │   ├── QAFilterBar.tsx       # 필터 [전체/미답변/답변완료] + 정렬
    │   │   ├── MessageList.tsx
    │   │   ├── QuestionCard.tsx      # 상태 배지, [이전 세션 기록] 배지
    │   │   ├── ReplyThread.tsx       # 대댓글 목록 + 호스트 답변 폼
    │   │   ├── MessageInput.tsx      # [질문]/[일반 메시지] 선택, 글자 수 표시
    │   │   ├── HostToolbar.tsx       # Export, Import, 발표자 링크, 방 종료
    │   │   ├── ExportModal.tsx
    │   │   ├── ImportModal.tsx
    │   │   └── RoomExpiredOverlay.tsx
    │   ├── history/HistoryList.tsx
    │   └── admin/                    # MetricsCard, ServerHealthPanel, ActiveRoomsTable,
    │                                 # SystemSettingsForm, ProfanityManager, UserApprovalTable, CloudRoomsTable
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useRoomSocket.ts
    ├── lib/                          # 클라이언트/공용
    │   ├── firebase/client.ts        # Firebase 앱 + Auth 초기화
    │   ├── socket.ts                 # Socket.io 클라이언트 래퍼
    │   ├── sessionExport.ts          # Blob JSON/TXT 생성
    │   ├── sessionImport.ts          # 파일 읽기, Zod 검증, 정규화
    │   ├── slug.ts                   # 슬러그 생성, 형식/예약어 검증
    │   └── constants.ts
    ├── server/                       # 서버 전용 (server.ts, API 라우트에서만 import)
    │   ├── socketServer.ts           # 소켓 이벤트 핸들러
    │   ├── firebaseAdmin.ts          # Admin SDK 초기화
    │   ├── authz.ts                  # ID 토큰/관리자 Claim/hostToken 검증
    │   ├── crypto.ts                 # AES-256-GCM 암복호화
    │   ├── rateLimit.ts              # 소켓 단위 토큰 버킷
    │   ├── profanityFilter.ts
    │   ├── metrics.ts                # 메모리/CPU/접속자 수집
    │   ├── expirySweeper.ts          # 만료 방 정리 (휘발성 + Firestore)
    │   ├── settings.ts               # 시스템 설정 캐시
    │   ├── context.ts                # globalThis 싱글턴 (store, io)
    │   └── storage/
    │       ├── types.ts              # VolatileStore 인터페이스
    │       ├── memoryStore.ts
    │       ├── redisStore.ts
    │       ├── index.ts              # REDIS_URL 유무로 구현 선택
    │       └── firestoreRepo.ts      # 영구 저장 (암호화 write-through)
    └── types/
        ├── room.ts
        ├── message.ts
        ├── session.ts
        ├── user.ts
        └── settings.ts
```

> [!IMPORTANT]
> Next.js는 API 라우트 코드를 별도로 번들링하므로 `server.ts`와 API 라우트가 **서로 다른 모듈 인스턴스**를 가질 수 있습니다. 스토어와 Socket.io 인스턴스는 `src/server/context.ts`에서 `globalThis`에 한 번만 생성해 공유합니다.

---

## 4. 데이터 모델

### 4.1 Firestore 컬렉션 (사양서 §4 SQL 대체)

| 경로 | 주요 필드 | 대응 사양 |
| :--- | :--- | :--- |
| `users/{uid}` | `email`, `role` (`admin`/`user`), `canPersist`, `emailVerified`, `approvedBy`, `approvedAt`, `createdAt` | 사용자 승인 관리 |
| `rooms/{roomId}` | `slug`, `title`, `hostUid`, `isCloudPersisted: true`, `consentAt`, `expiresAt`, `createdAt` | `rooms` 테이블 |
| `rooms/{roomId}/messages/{messageId}` | `parentId` (null 또는 질문 ID), `nicknameEnc`, `contentEnc`, `isQuestion`, `isHostReply`, `status`, `isRestored`, `createdAt`, `expiresAt` | `messages` 테이블 (`parent_id` 자기참조 유지) |
| `slugs/{slug}` | `roomId`, `expiresAt` | `slug UNIQUE` (트랜잭션으로 중복 방지) |
| `settings/system` | `defaultTtlMinutes`, `maxTtlMinutes`, `maxMessageLength`, `rateLimit` | 관리자 설정 |
| `settings/profanity` | `words: string[]` | 금칙어 사전 |

- **일반(익명) 방은 Firestore에 아무것도 저장하지 않습니다.**
- 암호화 대상: 메시지 `nickname`, `content` (`iv`와 `authTag`를 함께 저장).
- 인덱스: `rooms(hostUid, createdAt desc)`, `rooms(expiresAt)`, `messages(createdAt)`.

### 4.2 `firestore.rules` 원칙

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /{document=**} {
      allow read, write: if false;   // 모든 접근은 서버 Admin SDK 경유
    }
  }
}
```

### 4.3 휘발성 스토어 키 설계 (Redis / 메모리 동일 인터페이스)

| 키 | 타입 | 내용 |
| :--- | :--- | :--- |
| `room:{slug}` | Hash | `title`, `hostTokenHash`, `isCloudPersisted`, `roomId`, `expiresAt`, `createdAt` |
| `room:{slug}:msgs` | Hash | `messageId` → 메시지 JSON |
| `room:{slug}:order` | List | 메시지 ID 생성 순서 |
| `room:{slug}:presence` | Set | 접속 중인 소켓 ID |
| `rooms:active` | Sorted Set | score = `expiresAt` (모니터링, 만료 스윕용) |

- 방 단위 모든 키에 동일한 `EXPIREAT`를 지정합니다(서버가 죽어도 Redis에서 자동 삭제).
- **만료 처리**: `expirySweeper`가 5초마다 `rooms:active`에서 만료된 방을 찾아 `room_expired`를 브로드캐스트한 뒤 키를 즉시 삭제합니다.
- **메모리 폴백**: `Map` 기반, 같은 인터페이스, 같은 스윕 로직으로 만료를 처리합니다.

### 4.4 TypeScript 타입 (`types/message.ts`)

```typescript
export type MessageStatus = 'pending' | 'answered';

/** 저장 단위: 평면 구조 (parentId로 대댓글 연결) */
export interface StoredMessage {
  id: string;
  parentId: string | null;
  nickname: string;
  content: string;
  isQuestion: boolean;
  isHostReply: boolean;
  status: MessageStatus;      // 질문에만 의미 있음
  isRestored: boolean;
  createdAt: string;          // ISO 8601
}

/** 화면/Export 단위: 질문 아래 replies 중첩 */
export interface ThreadedMessage extends Omit<StoredMessage, 'parentId'> {
  parent_id: null;
  replies: Array<Pick<StoredMessage, 'id' | 'nickname' | 'content' | 'isHostReply' | 'createdAt'>>;
}
```

### 4.5 세션 Export / Import JSON (사양서 §5 호환)

```json
{
  "service": "IGOTQ",
  "version": "1.0",
  "exportedAt": "2026-10-14T08:50:00Z",
  "roomInfo": { "title": "2026 AI 융합교육 세미나", "slug": "ai-edu-2026" },
  "messages": [
    {
      "id": "msg-001",
      "parent_id": null,
      "nickname": "김철수",
      "content": "다음 회차 세미나 자료집은 어디서 다운로드받나요?",
      "status": "answered",
      "createdAt": "2026-10-14T08:15:20Z",
      "replies": [
        { "id": "msg-002", "nickname": "발표자(Host)", "content": "세미나 종료 후 이메일로 발송됩니다.", "createdAt": "2026-10-14T08:17:00Z" }
      ]
    }
  ]
}
```

- **변환 규칙**: 저장소의 평면 구조(`parentId`) ↔ Export의 중첩 구조(`replies`). Import 시 `parent_id`와 `parentId`를 모두 허용하고, 평면 배열이 들어와도 중첩 구조로 정규화합니다.
- **Import 제한**: 파일 최대 2MB, 메시지 최대 2,000건. 클라이언트와 서버 양쪽에서 Zod로 검증하고, 복원된 모든 메시지에 `isRestored: true`를 지정합니다.
- **TXT 형식 예시**:

```text
[IGOTQ] 2026 AI 융합교육 세미나 (ai-edu-2026) — 내보낸 시각 2026-10-14 17:50 KST

Q1. [답변 완료] 김철수 (08:15)
    다음 회차 세미나 자료집은 어디서 다운로드받나요?
    └ 발표자(Host) (08:17): 세미나 종료 후 이메일로 발송됩니다.
```

---

## 5. 권한 및 인증 모델

### 5.1 역할 정의

| 역할 | 식별 방법 | 가능한 작업 |
| :--- | :--- | :--- |
| 청중 | 닉네임만 (로그인 없음) | 질문/메시지 작성, 조회, 필터/정렬 |
| 호스트/발표자 | 방 생성 시 발급된 **`hostToken`** | 대댓글 답변, 상태 변경, 메시지 삭제, Import, Export, 방 종료 |
| 승인 사용자 | **Firebase 이메일 로그인** + `users/{uid}.canPersist == true` | 위 호스트 권한 + 클라우드 저장 방 생성, 히스토리 조회/복원 |
| 관리자 | 이메일 로그인 + **Custom Claim `admin: true`** | 관리자 대시보드 전체 |

### 5.2 호스트 토큰
- 방 생성 API가 무작위 32바이트 `hostToken`을 발급합니다. 클라이언트는 `localStorage`의 `igotq:host:{slug}`에 보관하고, 서버(Redis)에는 **SHA-256 해시만** 저장합니다.
- 소켓 `join_room` 시 토큰을 보내면 서버가 해시를 비교해 해당 소켓을 호스트로 표시합니다.
- **발표자 링크**: 호스트가 `/{slug}#host={token}` 형태의 링크를 복사해 공동 발표자에게 공유할 수 있습니다(해시 프래그먼트라 서버 로그에 남지 않음).
- 클라우드 저장 방은 추가로 **로그인한 uid == `hostUid`**인지도 확인합니다.

### 5.3 이메일 로그인 흐름 (Firebase Authentication)
1. Firebase 콘솔에서 **Email/Password** 제공업체를 활성화합니다.
2. `/login`에서 가입 → `sendEmailVerification` 발송 → 인증 완료 후 로그인합니다.
3. 로그인하면 클라이언트가 ID 토큰을 붙여 `/api/me`를 호출하고, 서버가 `users/{uid}` 문서를 생성/갱신합니다(`canPersist: false` 기본값).
4. 관리자가 대시보드에서 **이메일 인증을 마친 사용자**에게만 `canPersist`를 부여/철회합니다.
5. 비밀번호 재설정은 `sendPasswordResetEmail`을 사용합니다.
6. 최초 관리자는 `npm run set-admin -- <email>` 스크립트로 Custom Claim을 부여합니다.

### 5.4 서버 측 검증
- API 라우트: `Authorization: Bearer <idToken>` → `verifyIdToken` → 역할 확인.
- 소켓: 핸드셰이크 `auth.idToken`(선택)과 `auth.hostToken`(선택)을 검증합니다.

---

## 6. 실시간 소켓 이벤트 명세

| 방향 | 이벤트 | 권한 | 설명 |
| :--- | :--- | :--- | :--- |
| C→S | `join_room` | 모두 | `{ slug, nickname, hostToken?, idToken? }` |
| C→S | `send_message` | 모두 | `{ content, isQuestion }`, 레이트 리밋/글자 수/금칙어 적용 |
| C→S | `send_reply` | 호스트 | `{ parentId, content }` → 질문 상태 자동 `answered` |
| C→S | `toggle_status` | 호스트 | `{ messageId, status }` 수동 전환 |
| C→S | `delete_message` | 호스트 | 부적절한 메시지 삭제 |
| C→S | `import_session` | 호스트 | Zod 재검증 후 일괄 주입 |
| C→S | `close_room` | 호스트 | 즉시 종료 및 삭제 |
| S→C | `room_state` | — | 입장 시 방 정보, 전체 메시지, 접속자 수 |
| S→C | `message_created` / `message_updated` / `message_deleted` | — | 변경 전파 |
| S→C | `participants_updated` | — | 접속자 수 변경 |
| S→C | `session_imported` | — | 복원 완료 |
| S→C | `room_expired` | — | TTL 만료 또는 호스트 종료 |
| S→C | `error` | — | `{ code, message }` (`RATE_LIMITED`, `FORBIDDEN`, `TOO_LONG` 등) |
| `/admin` 네임스페이스 | `metrics` | 관리자 | 5초마다 서버 지표 푸시 |

### 6.1 스팸 / 품질 방지
- 소켓별 토큰 버킷 (기본 10초당 5건, 관리자 설정에서 변경 가능)
- 같은 소켓의 연속 동일 내용 메시지 차단
- 최대 글자 수 초과 거부, 금칙어는 `***`로 마스킹
- 닉네임 길이 제한 (최대 20자)

### 6.2 슬러그 규칙
- 형식: `^[a-z0-9-]{3,50}$`, 미입력 시 자동 생성
- 예약어 금지: `admin`, `api`, `login`, `history`, `_next`, `static`, `favicon.ico`

---

## 7. 화면별 기능

| 화면 | 주요 기능 |
| :--- | :--- |
| **홈 `/`** | 방 코드 참여 / 방 만들기 (제목, 슬러그, 유지 시간: 관리자 설정 범위 안에서 선택) / **이전 세션 JSON 드롭존** / 로그인 + `canPersist` 사용자에게만 **[온라인 상에 세션 기록 저장] 토글** + 동의 체크박스 (`consentAt` 기록) |
| **방 `/[slug]`** | 닉네임 입력 → 헤더(접속자 수, 남은 시간 카운트다운, 링크 복사) → 필터 `[전체/미답변/답변완료]` + 정렬 `[최신순/오래된순/미답변 우선]` → 질문 카드(상태 배지, `[이전 세션 기록]` 배지, 대댓글 펼침/접힘) → 입력 바(질문/메시지 선택, Enter 전송, 글자 수 표시) → 호스트 툴바 |
| **로그인 `/login`** | 이메일 로그인, 가입, 인증 메일 재발송, 비밀번호 재설정 |
| **히스토리 `/history`** | 승인 사용자 본인의 클라우드 세션 목록 → **원클릭 복원** (새 방 생성 + `isRestored` 주입) |
| **관리자 `/admin`** | 지표 카드(활성 방, 동시 접속자, 메모리, CPU) · 활성 방 테이블 · 시스템 설정(기본 TTL, 최대 글자 수, 레이트 리밋) · 금칙어 관리 · 사용자 승인 테이블 · 클라우드 방 목록/복원 |

---

## 8. 단계별 구현 마일스톤

### 📌 M1. 프로젝트 기반
- Next.js + TypeScript 초기화, `server.ts`(tsx) 커스텀 서버로 Next와 Socket.io를 단일 포트에서 실행
- Tailwind v4 (`@tailwindcss/postcss`, `@theme` 토큰), 다크 테마/글래스모피즘 디자인 시스템
- ESLint flat config, `.env.example`, `src/server/context.ts` 싱글턴

### 📌 M2. Firebase 연동 및 이메일 인증
- `lib/firebase/client.ts`, `server/firebaseAdmin.ts`
- `firestore.rules`(전면 차단), `firestore.indexes.json`, `firebase.json`, `.firebaserc`
- `AuthProvider`, `/login` 화면, `/api/me`, `scripts/set-admin.ts`

### 📌 M3. 휘발성 스토리지 및 만료
- `VolatileStore` 인터페이스, `memoryStore` / `redisStore`, 키 설계와 `EXPIREAT`
- `expirySweeper` (5초 주기), `REDIS_URL`이 있으면 `@socket.io/redis-adapter` 연결

### 📌 M4. 실시간 소켓 및 권한
- 6장의 이벤트 전체, `hostToken` 발급/검증, ID 토큰 검증
- 레이트 리밋, 금칙어, 글자 수, 슬러그 검증

### 📌 M5. 클라이언트 UI
- 홈(방 생성/참여/Import 드롭존/클라우드 토글+동의), 방 화면 전체 컴포넌트
- 만료 오버레이, 반응형 레이아웃, 마이크로 애니메이션

### 📌 M6. 세션 Export / Import
- JSON/TXT Blob 다운로드, 평면↔중첩 정규화, 2MB/2,000건 제한, 양쪽 Zod 검증

### 📌 M7. 클라우드 영구 저장 (승인 사용자)
- `firestoreRepo`: 메시지 생성 시 AES-256-GCM 암호화 후 write-through (실시간 처리는 메모리 캐시)
- 만료 처리: `expirySweeper`가 `rooms.expiresAt` 경과 방을 `recursiveDelete`로 즉시 삭제, 보조로 Firestore TTL 정책(`expiresAt`)도 설정
- `/history` 화면과 복원 API

### 📌 M8. 관리자 대시보드
- `metrics.ts` (`process.memoryUsage`, `process.cpuUsage`, `os.loadavg`, `io.engine.clientsCount`)
- `/admin` 네임스페이스 실시간 푸시, 설정/금칙어/사용자 승인/클라우드 방 API와 화면

### 📌 M9. 정적 검증 (Rule 2)
- `npm run type-check` (`tsc --noEmit`)
- `npm run lint` (`eslint .`)

---

## 9. 배포 시 고려사항

- Socket.io 커스텀 서버는 **항상 켜져 있는 Node 프로세스**가 필요합니다. Firebase Hosting(정적)이나 Vercel 서버리스에서는 동작하지 않습니다.
- 후보: **Google Cloud Run**(같은 GCP 프로젝트, WebSocket 지원, 세션 어피니티 설정), Render, Fly.io, Railway, VPS.
- 인스턴스를 2개 이상 띄우면 `REDIS_URL`(Memorystore, Upstash 등)이 반드시 필요합니다.
- Firebase는 **Spark(무료) 플랜**으로 시작할 수 있습니다(Cloud Functions 미사용). Firestore 일일 무료 한도를 넘으면 Blaze 전환을 검토합니다.

---

## 10. 점검 보고서 반영 내역 (v1.0 → v1.1)

| 점검 항목 | 반영 위치 |
| :--- | :--- |
| `server.js`에서 `.ts` import 불가 | §2.2 `server.ts` + `tsx` |
| Windows `NODE_ENV` 문법 | §2.2 `cross-env` |
| 호스트 권한 모델 없음 | §5.2 `hostToken` |
| 관리자/승인 사용자 인증 없음 | §5.1, §5.3 이메일 로그인 + Custom Claim |
| DB 클라이언트/스키마 없음 | §4.1 Firestore 컬렉션, §4.2 보안 규칙 |
| `next lint` 의존성 누락 | §2.2 `eslint`, `eslint-config-next` |
| Redis TTL 전략 | §4.3 |
| 메모리 폴백 만료 | §4.3 |
| 서버 측 Export API | 제거 (클라이언트 Blob만 사용) |
| DB↔JSON 구조 변환 | §4.4, §4.5 |
| 관리자 설정 패널 / 메모리·CPU | §7, M8 |
| 클라우드 히스토리 복원 | §7 `/history`, M7 |
| 클라우드 토글 + 동의 | §7 홈 화면 |
| 암호화 보관 | §4.1, M7 AES-256-GCM |
| 스팸 방지 | §6.1 |
| 정렬 | §7 방 화면 |
| `.env.example` | §2.4 |
| 예약 슬러그 | §6.2 |
| 닉네임 입력 / 질문·메시지 구분 / TXT 형식 | §3, §7, §4.5 |

---

## 11. 에이전트 작업 실행 원칙

- **Rule 1**: 개발 중 임의로 브라우저를 띄우거나 스크린샷을 찍지 않습니다.
- **Rule 2**: 코드 작성 후 `npm run type-check`, `npm run lint`로 검증합니다.
- **Rule 3 & 4**: 사용자가 `/git-commit`을 입력할 때까지 커밋/푸시하지 않습니다.
- **Rule 7**: 사용자가 **`/apply`**를 입력하면 M1부터 순서대로 구현을 시작합니다.
