# Project Handoff — 2026.07.11 최신

추민석 포트폴리오, Vite React 앱입니다. 다음 세션에서 이 파일을 먼저 읽으면 됩니다.
구조/컨벤션/불변 규칙은 `CLAUDE.md`, 코딩 스타일은 `AGENTS.md` 참고.

## 배포 / 원격 (07-11 신규)

- **라이브**: https://potfolio-green-seven.vercel.app (Vercel 계정 `gmcms226-8441`, 프로젝트명 `potfolio`)
- **GitHub**: https://github.com/gmcms226-web/potfolio (비공개) — 집/다른 PC에서는 `git clone` 후 작업
- **`main` 푸시 = 자동 프로덕션 배포** (Vercel–GitHub 연동 완료, 07-11 확인). 수동 배포는 `vercel deploy --prod --yes`
- `vercel.json`에 SPA rewrite 있음 (`/projects/:slug` 새로고침 404 방지)
- ⚠️ `github.com/gmcms226-web/portfolio`(오타 없는 이름)는 07-11에 실수로 생성된 빈 저장소 — 웹에서 삭제 권장

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
- 모바일 검수 스크린샷은 `scripts/shots/mobile/`에 있음 (390×844 기준).

## 오늘(07-11) 적용한 변경

### 1. 마케팅 케이스스터디 글쓰기 해부 수정 (전부 사용자 확정)
- 애견미용 성과 캡션 교체: "다른 블로거들의 파생 후기" → 전부 직접 운영한 멀티채널 + 당근마켓 바이럴로 매출 향상 (사실관계 교정 — 후기 캡처들은 전부 본인 채널).
- 과외 챕터에 취재 배경 문단 추가 — `caseStudies.js`의 챕터 `desc` 필드 + `CaseStudy.jsx` 렌더링 + `chapterDesc` 스타일 (다른 챕터에도 재사용 가능).
- 과외 성과↔전환 순서 교체 + "그 결과 —" 제거, 입시 프로세스↔전환 순서 교체.

### 2. 웹 화보 P.02 완성 — `project-2-3.png`
- 지도·날씨·로그인·회원가입 **2×2 타일 합성본** 직접 제작·적용 (사용자 확정).
- 재료: 지도=ljm location.html 네이버 지도(**키가 `127.0.0.1:5500` origin에만 등록** — 그 포트로 서빙해야 렌더링), 날씨=세종 클론 위젯, 로그인/회원가입=ljm 모달(JS 강제표시 후 요소 캡처).

### 3. 개인 프로젝트 제목 변경
- "AI Lyrics" → **"작사 노트"** (meta: Lyric Writing Project) — AI가 쓴 가사처럼 보이는 오해 제거, 작사는 본인·AI는 검수.

### 4. 모바일(390px) 반응형 검수 — 전 구간 수정
- POV 원 겹침/잘림: 미디어쿼리 `--tx:0`이 `:first-child`(±42px) 특이도에 밀리던 버그 수정 + 폰트 18px.
- 헤더 모바일 축소(로고 24px), 망설임 키워드 z-층을 카드 아래로, 모자이크 타일 40vw→24vw, Hero 터널 카드 0.55→0.72, 폴딩 잔상 0.18→0.05 + 이동/페이드 분리.
- 정체성 장면: 필러 카드를 워터마크 아래로 분리(margin-top), 워터마크 top 44%, "MARKETII" 라벨 잘림 수정(14px).
- 매거진 카드 글자 찌그러짐: 커버 ISSUE 줄 세로 스택+keep-all, 커버 타이포 축소(서브 둘째 줄 잘림 해결), 백커버 콜로폰 한 줄 고정.
- POV 제목이 헤더와 스치며 깨져 보이는 건 `difference` 블렌드 의도 디자인(데스크톱 동일) — 보류.

## 대기 중 / 할 것

1. **자동화 화보 2장** (`projects/project-3-2·3-3`) — 사용자의 Make 자동 발행이 막혀 방법 찾는 중. 재촉 금지. 발행 안 돼도 Make 시나리오 편집 화면·실행 로그 캡처면 충분하다고 안내해둠.
2. **miki 배포 URL** — 나오면 `miki/README.md` 링크 칸(현재 example.com) + 케이스스터디 링크 칩 추가.
3. (보류 유지) Hero 터널 work-17~20 — 이미지는 폴더에 있음, WORKS 배열 4개 추가 + TRAVEL 확장만 하면 됨. 사용자 승인 대기.
4. (보류 유지) Hero B안(중앙 앵커 카피+카운터) 판단.
5. 배포 후 개선: 이미지 WebP 최적화(pillar/value/write/voyage/case ~수 MB, 빌드 청크 경고), 미사용 파일 정리(search-demo.webm, ship.png, 원본 mp4), 파비콘 404, 모바일 실기기 검증.

## 주의 (불변)

- 커서 커스텀 절대 제안 금지.
- 회사명 노출은 Record 경력 줄 외 금지.
- scrub/핀 길이 값 임의로 줄이지 말 것.
- 오프닝 영상 교체 시 반드시 짧은 GOP로 재인코딩 (`ffmpeg … -g 4 -keyint_min 4 -sc_threshold 0 …`).
- POV 섹션에 GSAP 넣지 말 것 + 호버 스왑(4번) 재제안 금지.

## 마지막 확인 상태

- `npm.cmd run build` 통과 (청크 경고만).
- 모바일 재검수(수정 지점 전부) + 데스크톱 회귀(check.mjs, check-magazine.mjs) 스크린샷 확인 완료.
- 프로덕션 배포 최신 (모든 커밋 반영).
