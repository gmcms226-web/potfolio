import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Hero.module.css'

gsap.registerPlugin(ScrollTrigger)

/* src/assets/works/ 폴더의 이미지를 파일명 번호로 자동 연결.
   work-01.png → 1번 카드, work-02.png → 2번 카드 … (확장자·대소문자 무관)
   이미지가 없는 번호는 플레이스홀더로 표시된다. */
const imageModules = import.meta.glob('../../../assets/works/*', {
  eager: true,
  import: 'default',
})
const imageByNum = {}
for (const [path, url] of Object.entries(imageModules)) {
  const match = path.match(/work-?(\d+)/i)
  if (match) imageByNum[parseInt(match[1], 10)] = url
}

/* 작업물 카드 배치 — 사방(좌·우·천장·바닥)이 카드로 둘러싸인 터널.
   스크롤 스크럽으로 터널을 빠져나가며 카드들이 각자 자기 벽 방향으로 흩어진다.
   - side: 'left' | 'right' | 'top' | 'bottom' — 소속 벽 (= 퇴장 방향)
   - x, y: 화면 중앙 기준 오프셋 (vw / vh %)
   - z: 시작 깊이(px) — 소실점 끝에서 작게 나타나 당겨지듯 다가온다
   - h: 카드 높이 (vh %) */
const WORKS = [
  { id: 1, side: 'left', x: -22, y: -6, z: -350, h: 56 },
  { id: 2, side: 'right', x: 22, y: 8, z: -630, h: 52 },
  { id: 3, side: 'top', x: -6, y: -30, z: -910, h: 40 },
  { id: 4, side: 'bottom', x: 8, y: 30, z: -1190, h: 42 },
  { id: 5, side: 'left', x: -23, y: 10, z: -1470, h: 54 },
  { id: 6, side: 'right', x: 23, y: -8, z: -1750, h: 56 },
  { id: 7, side: 'top', x: 10, y: -31, z: -2030, h: 40 },
  { id: 8, side: 'bottom', x: -8, y: 31, z: -2310, h: 42 },
  { id: 9, side: 'left', x: -21, y: -10, z: -2590, h: 58 },
  { id: 10, side: 'right', x: 22, y: 10, z: -2870, h: 52 },
  { id: 11, side: 'top', x: -4, y: -30, z: -3150, h: 38 },
  { id: 12, side: 'bottom', x: 6, y: 30, z: -3430, h: 40 },
  { id: 13, side: 'left', x: -22, y: 4, z: -3710, h: 56 },
  { id: 14, side: 'right', x: 23, y: -4, z: -3990, h: 54 },
  { id: 15, side: 'top', x: 4, y: -31, z: -4270, h: 40 },
  { id: 16, side: 'bottom', x: -6, y: 30, z: -4550, h: 42 },
]

/* 벽 각도: 카드가 터널 안쪽을 향해 기울어 있는 기본 각도.
   퇴장 시 이 각도가 풀리며 정면을 스치고, 바깥으로 기울어 사라진다 */
const BASE_ANGLE = 40
const EXIT_OVERSHOOT = 1.5 // 1이면 정면에서 끝, 1.5면 정면을 지나 바깥으로 기운다

const TRAVEL = 5600 // 통과 완료까지 카메라가 전진하는 총 깊이(px)
const PLAY_FROM = -0.45 // 시작 진행값 — 이만큼 소실점 너머에서 빨려나오기 시작
const PLAY_DURATION = 5.5 // 터널 통과 타임라인 길이(단위) — SCROLL_LENGTH에 매핑된다
const SCROLL_LENGTH = '+=500%' // pin 상태로 스크럽되는 스크롤 분량 — 통과 속도 조절은 여기서

/* 카메라 근접 시 퇴장 구간 */
const REVEAL_START = -600
const REVEAL_END = 250
const SPREAD = 0.3 // 좌우 벽 카드가 바깥으로 밀려나는 거리 (뷰포트 폭 비율)
const SPREAD_V = 0.4 // 천장·바닥 카드가 위아래로 밀려나는 거리 (뷰포트 높이 비율)

/* 마무리 없음 — 터널은 순수하게 작업물 통과만 담당하고 Projects로 인계한다.
   (정체성 공개·필러 카드는 Reaction 섹션 끝으로 이동) */

/* 마우스 패럴랙스 — 가까운 카드일수록 크게 반응 */
const PARALLAX_BASE = 14 // px
const PARALLAX_DEPTH = 46 // px (근접 카드 추가 반응)
const MOUSE_SMOOTHING = 0.06

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

function Hero() {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const progress = useRef({ p: PLAY_FROM })
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // 스크롤 스크럽: 섹션을 pin하고 스크롤 진행률이 카메라 전진(p)을 움직인다.
  // 연출 자체(ticker가 p값으로 카드를 배치)는 자동 재생 시절과 동일하다
  useEffect(() => {
    if (reduced) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: SCROLL_LENGTH,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      },
    })

    // 카메라 전진 — 선형. 이징(power2.out)을 걸면 이동이 초반에 몰려
    // 핀 후반 40%가 빈 터널이 된다 (부드러움은 scrub 1.2가 담당)
    tl.to(
      progress.current,
      { p: 1, duration: PLAY_DURATION, ease: 'none' },
      0,
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [reduced])

  useEffect(() => {
    if (reduced) return

    const mouse = { x: 0, y: 0 }
    const mouseTarget = { x: 0, y: 0 }

    const onMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const p = progress.current.p

      mouse.x += (mouseTarget.x - mouse.x) * MOUSE_SMOOTHING
      mouse.y += (mouseTarget.y - mouse.y) * MOUSE_SMOOTHING

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const c = WORKS[i]
        const z = c.z + p * TRAVEL
        const horizontal = c.side === 'left' || c.side === 'right'
        // 좌/상 벽은 음(-) 방향, 우/하 벽은 양(+) 방향으로 퇴장
        const dir = c.side === 'left' || c.side === 'top' ? -1 : 1

        // 카메라 근접도(0~1): 가까워질수록 자기 벽 바깥으로 갈라지며 기울어 퇴장
        const veer = easeOutCubic(
          clamp((z - REVEAL_START) / (REVEAL_END - REVEAL_START), 0, 1),
        )

        // 깊이 비례 마우스 패럴랙스 — 가까운 카드가 더 크게 흐른다
        const depth = clamp((z + 3500) / 3500, 0, 1)
        const px = -mouse.x * (PARALLAX_BASE + depth * PARALLAX_DEPTH)
        const py = -mouse.y * (PARALLAX_BASE + depth * PARALLAX_DEPTH) * 0.7

        // 멀리서는 터널 안쪽을 향해 기울어 있다가(±BASE_ANGLE),
        // 다가오며 정면을 스치고, 퇴장하며 바깥으로 기운다
        const swing = BASE_ANGLE * (1 - EXIT_OVERSHOOT * veer)
        let xPx = (c.x / 100) * vw + px
        let yPx = (c.y / 100) * vh + py
        let rotate
        if (horizontal) {
          xPx += dir * veer * SPREAD * vw
          rotate = `rotateY(${-dir * swing + mouse.x * -4}deg)`
        } else {
          yPx += dir * veer * SPREAD_V * vh
          rotate = `rotateX(${dir * swing + mouse.y * 4}deg)`
        }

        // 소실점 끝: 작게 나타나 서서히 형체를 드러낸다.
        // 퇴장: 페이드가 아니라 사방으로 빠져나가는 움직임이 주인공
        const fadeIn = clamp((z + 3800) / 600, 0, 1)
        const fadeOut = clamp((750 - z) / 350, 0, 1)

        el.style.transform = `translate(-50%, -50%) translate3d(${xPx}px, ${yPx}px, ${z}px) ${rotate}`
        el.style.opacity = Math.min(fadeIn, fadeOut)

        // 거리 기반 조명 — 소실점의 카드는 어둡고 바래 있다가, 다가올수록 원색으로 살아난다
        const light = clamp((z + 3800) / 3200, 0, 1)
        el.style.filter = `brightness(${(0.4 + 0.6 * light).toFixed(3)}) saturate(${(0.7 + 0.3 * light).toFixed(3)})`
      })
    }

    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('mousemove', onMove)
    }
  }, [reduced])

  if (reduced) {
    // 모션 최소화 사용자: 깊이 연출 대신 태그라인 + 세 카드 + 정적 그리드
    return (
      <section className={styles.staticGrid}>
        {WORKS.map((c) => (
          <div key={c.id} className={styles.card}>
            <Thumb card={c} />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={styles.track}>
      <div className={styles.viewport}>
        {WORKS.map((c, i) => (
          <div
            key={c.id}
            ref={(el) => (cardRefs.current[i] = el)}
            className={styles.card}
            style={{ '--card-h': `${c.h}vh`, opacity: 0 }}
          >
            <Thumb card={c} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Thumb({ card }) {
  const src = imageByNum[card.id]
  if (src) {
    return <img src={src} alt={`작업물 ${card.id}`} loading="lazy" />
  }
  return (
    <div className={styles.placeholder}>
      WORK {String(card.id).padStart(2, '0')}
    </div>
  )
}

export default Hero
