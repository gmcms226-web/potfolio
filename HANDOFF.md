# Project Handoff — 2026.07.10 최신

추민석 포트폴리오, Vite React 앱입니다. 다음 세션에서 이 파일을 먼저 읽으면 됩니다.
구조/컨벤션/불변 규칙은 `CLAUDE.md`, 코딩 스타일은 `AGENTS.md` 참고.

## 실행/검증

```bash
npm run dev          # http://localhost:5173/
npm.cmd run build    # PowerShell 실행 정책 때문에 .cmd 필요
node scripts/check.mjs           # 헤드리스 오프닝 시퀀스 스크린샷 (dev 서버 필요)
node scripts/check-reload.mjs    # 끝까지 스크롤 후 F5 케이스 검증
node scripts/check-magazine.mjs  # Projects 폴딩 카드 12칸 전부 스크린샷
node scripts/shoot-static.mjs <폴더> <페이지> <저장경로> [셀렉터|스크롤px]  # 로컬 정적 사이트 캡처
node scripts/shoot-case.mjs <slug|/경로> [스크롤px]  # 케이스스터디/홈 화면 캡처
```

- ScrollTrigger pin 섹션은 HMR 뒤 상태가 꼬임 — **화면 판단은 반드시 새로고침 후**.
- **이제 git 저장소임** (07-10 `git init`). 롤백 지점: `de31a8c`(매거진 작업 전). 되돌리기는 revert/diff로.
- 빌드는 통과하지만 큰 이미지 때문에 chunk/asset size 경고 있음 (기존 이슈).

## 오늘(07-10) 적용한 변경

### 1. Projects 폴딩 카드 = 매거진 에디토리얼 (5안 중 2번 확정)
- 카드1=커버(다크 타이포+REACTION. 마스트헤드), 카드2·3=화보 스프레드(캡션 컬럼+캡처), 카드4=백커버(성과 카피).
- 카피·캡션의 단일 출처는 `Projects.jsx`의 `CARD_PROJECTS[].magazine` 필드. 화보엔 `pos`(object-position) 옵션 있음 — 가로형 캡처 크롭 기준점 지정용.
- `src/assets/projects/project-N-M.*` 이미지가 있으면: 화보(2·3)는 사진으로, 커버(1)·백커버(4)는 카드 전체 교체.
- 채워진 칸: 1-2(상상코칭 네이버 검색 노출, left top 크롭), 1-3(과외 문의 문자), 2-2(ljm 리뉴얼 메인), 2-3(세종 클론 날씨 API — 사용자가 챗봇·날씨·로그인 합성 이미지로 교체 예정).
- **빈 칸: 3-2, 3-3 (자동화)** — 준비 중 카드로 렌더링됨.

### 2. 웹 케이스스터디(/projects/web) 챕터 구조로 재편
- CHAPTER 01 세종수목원 클론코딩(학습 재현) → 02 이정민 애견미용학원 리뉴얼(실전 문제해결) → 03 MIKIHOUSE 일체형 쇼핑몰(풀 커머스 흐름). **시간순** — 사용자 확인됨.
- 각 챕터: 섹션 2개 → 갤러리 3장(`case/web-N`, 01=4~6 그린 / 02=1~3 핑크 / 03=7~9 오렌지) → 회고 카드(레드 라벨+액센트 보더).
- 공용이던 "배운 것"을 챕터별 회고로 분리. 회고 문구는 내 초안 — 사용자 검토 전.
- `data.chapters`가 있으면 챕터 렌더링, 없으면 기존 flat 갤러리+sections (marketing/automation은 기존 방식).
- meta 기술 스택에 React·Vite·Polar Checkout 추가.
- 캡처 출처: 바탕화면 `ljm/`(리뉴얼), `SEJONG/`(클론), `miki/miki-app/dist`(쇼핑몰) — 전부 shoot-static.mjs로 로컬 캡처. 세종 지도 페이지는 네이버 지도 API가 localhost 미등록이라 인증 실패 → 제외.

### 3. POV 섹션 인터랙션 (제안 5개 중 1+2 확정)
- 키워드 원 순차 등장(가운데→왼→오, `--tx` 변수 + transition-delay 스태거) + 호버 시 부풀고 벌어짐(`hover:hover and pointer:fine` 전용).
- **규칙 준수: GSAP 금지, IO+CSS만.** 4번(호버 시 사례/질문 스왑)은 제안했으나 **사용자가 "그냥 냅두자"로 확정 — 다시 제안하지 말 것.**

### 4. 카피 변경 (전부 사용자 확정)
- 웹 폴딩 카드 desc: "사용자의 행동을 고려해 정보 구조를 재설계하고…"
- 웹 화보 P.01 캡션 "답이 먼저 보이는 메인", 마케팅 P.02 "검색이 문의로 바뀐 기록".
- 웹 백커버 보조 카피 제거("기획–디자인–개발–배포, 100%."만).
- AI Lyrics: 직접 작사 + AI는 검수 파트너 + **밴드 보컬이 가사 픽, 곡 제작 확정** (A안). 곡 발매되면 마지막 줄 업데이트.
- 직장인멍생활: 인스타 콘텐츠 기획 · 4컷툰 시리즈 2줄만.

### 5. 기타
- `case/marketing-1.png`(상상코칭 검색 노출) 마케팅 갤러리에 자동 반영됨.
- CLAUDE.md 드리프트 3건 수정(영상 파일명/재인코딩, write 컨벤션, 빌드 경고 에셋).

## 대기 중 / 할 것

1. **자동화 화보 2장** (`projects/project-3-2·3-3`) — 사용자의 Make 자동 발행이 막혀 방법 찾는 중. 재촉 금지. 발행 안 돼도 Make 시나리오 편집 화면·실행 로그 캡처면 충분하다고 안내해둠.
2. **웹 P.02 합성 이미지** — 사용자가 챗봇·날씨·로그인 합성본 제작 중 → `project-2-3` 교체 + 캡션 조정.
3. **miki 배포 URL** — 나오면 `miki/README.md` 링크 칸(현재 example.com) + 케이스스터디 링크 칩 추가. 리드미의 프로젝트명/기간/기여도 칸도 아직 템플릿 상태.
4. (보류 유지) Hero 터널 work-17~20 — **이미지는 이미 폴더에 있음**, WORKS 배열 4개 추가 + TRAVEL 5600→~6800 확장만 하면 됨. 사용자 승인 대기.
5. (보류 유지) Hero B안(중앙 앵커 카피+카운터) 판단.
6. 배포 전: 이미지 WebP 최적화(pillar/value/write/voyage/case ~수 MB), 미사용 파일 정리(search-demo.webm, ship.png, 원본 mp4, IMG_6893/6908), SPA 라우팅 설정, 모바일 실기기 검증, 파비콘 404.

## 주의 (불변)

- 커서 커스텀 절대 제안 금지.
- 회사명 노출은 Record 경력 줄 외 금지.
- scrub/핀 길이 값 임의로 줄이지 말 것.
- 오프닝 영상 교체 시 반드시 짧은 GOP로 재인코딩 (`ffmpeg … -g 4 -keyint_min 4 -sc_threshold 0 …`, 07-09 항목 참고).
- POV 섹션에 GSAP 넣지 말 것 + 호버 스왑(4번) 재제안 금지.

## 마지막 확인 상태

- `npm.cmd run build` 통과 (청크 경고만).
- 헤드리스 검증: 폴딩 12칸(check-magazine), 웹 케이스 3챕터, POV 등장+호버 전부 스크린샷으로 확인 완료.
