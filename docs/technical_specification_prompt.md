# Technical Specification & AI Prompt: IGOTQ - Lightweight Backchannel Web App

## 1. Executive Summary & Core Concept

본 프로젝트는 **'IGOTQ (I Got A Question!)'**라는 서비스명 아래, 세미나, 컨퍼런스, 교실 수업 등에서 청중과 발표자가 장벽 없이 실시간으로 소통할 수 있도록 지원하는 **초간결성(Frictionless) 휘발성 백채널(Backchannel) 웹 애플리케이션** 사양서입니다.

* **서비스명:** **IGOTQ** (아이갓큐)
* **슬로건:** *"질문이 생겼을 땐? IGOTQ!"*
* **핵심 가치:** 회원가입 없는 3초 접속, 실시간 질문/답변 스레드, In-Memory 기반의 완전 휘발성 및 GDPR 준수.
* **차별화 기능:**
  1. **질문 상태 관리(미답변/답변 완료)** 및 스레드(Reply) 대댓글 답변.
  2. 일반 사용자의 **로컬 JSON 다운로드/업로드를 통한 세션 이어가기**.
  3. **시스템 관리자 대시보드** 및 승인된 사용자 대상 **온라인 데이터 클라우드 저장 옵션**.

## 2. Key Functional Specifications

### 2.1. Q&A & Reply Thread System (질문 상태 및 대댓글)
* **질문 상태 구분:** 모든 질문 카드는 `미답변 (Pending)` 및 `답변 완료 (Answered)` 상태로 구분.
* **대댓글(Reply) 기능:** 방장(Host) 및 발표자는 청중의 질문에 대댓글 형태로 답변을 작성할 수 있음. 답변 등록 시 해당 질문은 자동으로 `답변 완료` 상태로 전환됨.
* **필터링 & 정렬 UI:** 청중과 발표자는 `전체`, `미답변 질문`, `답변 완료` 탭을 선택하여 정렬 및 필터링 가능.

### 2.2. Dual Storage Architecture (차등 데이터 저장 모델)

| 구분 | 일반 사용자 (Anonymous / Standard) | 관리자 및 승인된 사용자 (Privileged) |
| :--- | :--- | :--- |
| **저장 방식** | **100% In-Memory (Redis / Memory Cache)** | **PostgreSQL Cloud DB + In-Memory Cache** |
| **데이터 수명** | 세션 종료 또는 TTL 만료 시 완전 증발 (Hard Delete) | 설정된 수명 동안 클라우드 DB에 암호화 보관 |
| **백업/복원** | 방 종료 시 **로컬 JSON/TXT 파일 다운로드**, 재개 시 **JSON 파일 업로드로 세션 복원** | 관리자 대시보드 및 클라우드 히스토리에서 클릭 한 번으로 복원 |
| **GDPR Compliance** | **Zero Data Retention** (서버 측 저장 데이터 없음) | 명시적 동의 및 암호화 보관 |

### 2.3. Host Local Session Import/Export (로컬 파일 기반 복원)
* **Export (다운로드):** 방 개설자(Host)는 언제든지 `현재 대화 기록 다운로드 (.json / .txt)` 버튼을 통해 로컬 PC에 메시지, 질문, 답변 스레드 데이터 전체를 저장 가능.
* **Import (세션 복원):** 새로 방을 개설하거나 이전 세션을 이어갈 때, 저장했던 JSON 파일을 드래그 앤 드롭으로 업로드하면 이전 대화 내용 및 답변 상태가 `[이전 세션 기록]` 태그와 함께 복원됨.

### 2.4. Admin System & Authorization (관리자 대시보드 및 승인)
* **Super Admin Dashboard:**
  * 전체 활성 방 개수, 동시 접속자 수, 메모리/CPU 사용량 실시간 모니터링.
  * 글로벌 비속어/스팸 필터링 단어장 관리.
  * 기본 방 유지 시간(TTL Default) 및 최대 글자 수 제한 설정.
* **User Approval Management (온라인 저장 권한 부여):**
  * 특정 사용자(이메일 또는 API Key 기준)에게 '온라인 클라우드 저장 권한'을 부여/철회 가능.
  * 승인받은 사용자는 방 생성 시 `[온라인 상에 세션 기록 저장]` 토글 스위치를 활성화할 수 있음.

## 3. Recommended Tech Stack

| 영역 | 추천 기술 스택 | 선정 사유 |
| :--- | :--- | :--- |
| **Frontend** | React (Next.js App Router), Tailwind CSS | Fast SSR/SSG, Responsive UI, Clean Component Design |
| **Realtime Engine** | Socket.io or Supabase Realtime / Redis PubSub | Sub-100ms 지연 시간의 실시간 브로드캐스팅 |
| **Volatile Cache** | Redis (In-Memory) | 일반 사용자 방의 빠른 읽기/쓰기 및 자동 TTL 데이터 파기 |
| **Persistent DB** | PostgreSQL (Supabase) | 승인된 사용자/관리자용 데이터 세션 저장 및 JSONB 호환성 |
| **State / File** | Client-Side Web Blob API | 서버 부하 없이 브라우저 단에서 JSON/TXT 파일 즉시 생성 |

## 4. Database & Data Schema Design

### 4.1. `rooms` Table (클라우드 저장 승인 방 및 시스템 관리용)

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- 예: igotq.com/room-slug
    title VARCHAR(100) NOT NULL,
    host_id UUID NULL, -- NULL일 경우 무가입 일반 사용자
    is_cloud_persisted BOOLEAN DEFAULT FALSE, -- 온라인 저장 여부 (승인된 사용자 전용)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2. `messages` Table

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    parent_id UUID NULL, -- 대댓글(Reply) 기능을 위한 Self-Reference (질문의 답글)
    nickname VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' (미답변), 'answered' (답변완료)
    is_restored BOOLEAN DEFAULT FALSE, -- JSON 업로드로 복원된 메세지 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_room_status ON messages(room_id, status);
```

## 5. Session Export / Import Data Format (JSON Schema)

방 개설자가 로컬 컴퓨터로 다운로드받고 재업로드할 때 사용하는 표준 JSON 구조입니다.

```json
{
  "service": "IGOTQ",
  "version": "1.0",
  "exportedAt": "2026-10-14T08:50:00Z",
  "roomInfo": {
    "title": "2026 AI 융합교육 세미나",
    "slug": "ai-edu-2026"
  },
  "messages": [
    {
      "id": "msg-001",
      "parent_id": null,
      "nickname": "김철수",
      "content": "다음 회차 세미나 자료집은 어디서 다운로드받나요?",
      "status": "answered",
      "createdAt": "2026-10-14T08:15:20Z",
      "replies": [
        {
          "id": "msg-002",
          "nickname": "발표자(Host)",
          "content": "세미나 종료 후 등록하신 이메일로 발송될 예정입니다.",
          "createdAt": "2026-10-14T08:17:00Z"
        }
      ]
    }
  ]
}
```

## 6. Complete AI Code Generation Prompt (LLM 활용 프롬프트)

인공지능 도구(Claude, ChatGPT 등)에 전달하여 **IGOTQ** 전체 코드를 생성할 때 사용할 수 있는 완성형 프롬프트입니다.

```text
[Role]
You are a Principal Full-Stack Architect specializing in high-concurrency real-time web applications, Node.js, Next.js, and Redis.

[Objective]
Build "IGOTQ" (I Got A Question) - a lightweight, highly performant, volatile backchannel web app with Q&A Threading, Admin Dashboard, and Dual Data Persistence Modes.

[Core Feature Requirements]
1. Frictionless Access & Chat:
   - Users enter via room URL/code (e.g., igotq.com/[slug]) and pick a nickname (no sign-up needed for general audience).
   - Real-time text messages & questions (<100ms latency via Socket.io / WebSockets).

2. Q&A Threading & Status:
   - Questions can be marked as 'Pending' or 'Answered'.
   - Hosts/Presenters can post direct replies to questions (threaded view). Adding a reply automatically marks the parent question as 'Answered'.
   - Filter controls: [All], [Pending Only], [Answered Only].

3. Dual Storage Architecture:
   - General Users (Volatile Mode): All messages live exclusively in Redis In-Memory. Hard-deleted on expiration.
   - Session Export/Import: Hosts can download chat history as a .json file. Uploading this JSON into a new room restores past history tagged as [Restored Session].
   - Privileged Users (Cloud Persisted Mode): Users approved by Admin can toggle "Save Session to Cloud DB (PostgreSQL)".

4. Admin Dashboard:
   - System settings panel to change default TTL, max character limits, and profanity filter lists.
   - User Approval system to grant/revoke "Cloud Storage Permissions" to registered accounts.

[Tech Stack]
- Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons.
- Backend/Realtime: Node.js / Next.js API Routes + Socket.io or Supabase Realtime + Redis.
- Database: PostgreSQL (for persistent rooms) + Redis (for volatile rooms).

[Deliverables Requested]
1. Complete PostgreSQL Database Schema + Redis TTL Management Strategy.
2. Next.js Client Component for the Interactive Chat Room (with Q&A filters, threaded reply UI, and JSON Export/Import buttons).
3. Client-side JSON Export (`Blob` generator) and Import parser logic.
4. Admin Dashboard UI Layout & User Approval Table component.
```