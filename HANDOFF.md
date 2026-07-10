# Project Handoff — 2026.07.09 최신

추민석 포트폴리오, Vite React 앱입니다. 다음 세션에서 이 파일을 먼저 읽으면 됩니다.
구조/컨벤션/불변 규칙은 `CLAUDE.md`(오늘 최신화됨), 코딩 스타일은 `AGENTS.md` 참고.

## 실행/검증

```bash
npm run dev          # http://localhost:5173/
npm.cmd run build    # PowerShell 실행 정책 때문에 .cmd 필요
node scripts/check.mjs         # 헤드리스 오프닝 시퀀스 스크린샷 (dev 서버 필요)
node scripts/check-reload.mjs  # 끝까지 스크롤 후 F5 케이스 검증
```

- ScrollTrigger pin 섹션은 HMR 뒤 상태가 꼬임 — **화면 판단은 반드시 새로고침 후**.
- 빌드는 통과하지만 큰 이미지 때문에 chunk/asset size 경고 있음 (기존 이슈).

## 오늘(07.09) 적용한 변경

### 1. Reaction 오프닝 대개편 — "웹 대항해"
- 레이더 장면 제거 → **안개 낀 바다 + 스크롤 구동 영상**으로 교체.
- `src/assets/voyage/ships-scrub.mp4` 를 스크롤이 `currentTime`으로 직접 구동 (진행 0~58 구간에 영상 전체를 폄).
- ⚠️ **영상 교체 시 반드시 재인코딩** — 원본은 키프레임이 길어 스크럽이 얼어붙음:
  ```
  ffmpeg -y -i 원본.mp4 -an -c:v libx264 -crf 26 -preset medium -g 4 -keyint_min 4 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart src/assets/voyage/ships-scrub.mp4
  ```
  (ffmpeg 경로: `node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)"`)
- 망설임 키워드(처음/부담/믿음/상황/가격/예약/후기): 크기 확대, **중앙 클러스터 → 사방으로 확산 소멸**.
- 여정 노드(고민→탐색→읽음→안심→문의): 3배 확대, 위치 75%로 하강, **이동 점 타이밍에 하나씩 등장**, 문자 장면 전 페이드아웃.
- 문자 버블 1.5배 확대. 문자 장면 뒤 **검은 밤이 아래에서 차올라** 모자이크 장면으로 전환 (배경 급전환 해소).
- pillar 카드 1.5배(`clamp(255px, 43vh, 450px)`), CHU MIN SEOK 워터마크 외곽선 강화.
- 미사용 파일: `voyage/sea.png`(poster로만 사용), `ship.png`·`Ships_sailing_hero.mp4`(원본, 번들 제외).

### 2. 전체 감속 (두 차례 요청 반영)
- Reaction `+=900%` / Hero `+=500%` / About 슬라이드당 210%+퇴장 85% / Projects 폴딩 `+=3200px` / POV 퇴장 1.5×viewport.
- Hero 카메라 전진을 power2.out → **선형**으로 (이징 때문에 핀 후반 40%가 빈 터널이던 버그 수정).

### 3. Hero 터널 질감
- 카드에 보더+깊은 그림자, **거리 기반 조명**(멀수록 어둡고 바래고 다가오면 원색) — ticker에서 filter 구동.

### 4. 케이스스터디 "글쓰기 해부" (marketing 상세)
- `src/assets/write/write-N-M.png` (N=캠페인: 1 애견미용/2 과외/3 입시, M=독자 여정 순서).
- 데이터: `caseStudies.js`의 `writing` 블록 (챕터/단계 태그/의도 캡션 — 문구 수정은 여기서만).
- 렌더: `CaseStudy.jsx` — 스티키 주석 + 캡처 2단 레이아웃. 미사용: IMG_6893, IMG_6908.

### 5. Record에 Capabilities 블록 (Contact에서 이동)
- 3기둥(MARKETING/WEB/AUTOMATION) 스킬 + 경력/자격 줄. 데이터는 `Record.jsx`의 `CAPABILITIES`/`CAREER`.
- 경력: **동화세상에듀코 콘텐츠 마케팅 8년 · ㈜예람 인턴 2개월** (회사명 노출은 이 줄만 허용).
- 자격: 광고기획전문가 · 마케팅조사분석사.

### 6. 타이포 전역 확대
- 헤더 브랜드 3배(`clamp(30px,3.5vw,45px)`), CONTACT 버튼 20px.
- **전역 최소 폰트 20px** — `tokens.css` body/caption 20px + 전 모듈 하드코딩 값 스윕 완료.

## 내일 할 것 / 보류 중인 결정

1. **Hero 터널 work-17~20 배치 추가** — 사용자가 "기둘" 보류. 진행 시 `WORKS` 배열에 4자리 추가 + `TRAVEL` 5600 → ~6800 확장 필수 (안 늘리면 마지막 카드가 화면에 걸린 채 끝남).
2. **Hero B안(중앙 앵커 카피 + 카운터)** — A(질감)만 적용된 상태 보고 판단하기로 함.
3. **Projects 폴딩 카드 12칸 전부 빈 상태** (`src/assets/projects/` 비어 있음 — 섹션 완성도 최대 병목).
   - 추천안: 카드1~3 = 목업 프레임 통일 이미지(9장 제작), 카드4 = 코드 타이포 성과 카드(C안).
   - 임시안(B): write/works/reaction 에셋에서 12장 복사 — 승인 대기.
4. 배포 전: 이미지 WebP 최적화(pillar/value/write/voyage ~수 MB), `reaction/search-demo.webm` 삭제 검토, 모바일 실기기 검증, SPA 라우팅 설정.

## 주의

- 커서 커스텀 절대 제안 금지.
- 회사명 노출은 Record 경력 줄 외 금지.
- scrub/핀 길이 값은 오늘 사용자 요청으로 늘린 값 — 임의로 줄이지 말 것 (CLAUDE.md에도 기록).

## 마지막 확인 상태

- `npm.cmd run build` 통과 (chunk 경고만).
- 헤드리스 검증: 오프닝 영상 스크럽 정상(진행률↔재생시간 선형), 터널 카드 분포 6→11→15→10→5장, 전체 47 뷰포트, 끝까지 스크롤 도달 OK.
