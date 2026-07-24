import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Reaction.module.css'
// poster는 배가 보이는 프레임(영상 2.5s 추출) — 영상 로드가 늦어도 배는 항상 보인다
import seaImg from '../../../assets/voyage/sea-poster.jpg'
// 스크럽 전용 재인코딩본 (키프레임 4프레임 간격) — 원본 Ships_sailing_hero.mp4는 GOP가 길어
// currentTime 탐색이 느려서 실제 브라우저에서 영상이 멈춘 것처럼 보인다
import seaVideo from '../../../assets/voyage/ships-scrub.mp4'

gsap.registerPlugin(ScrollTrigger)

/* 스크롤 주도 오프닝 시퀀스.
   안개 낀 바다의 항해(망설임) → 사용자 관점의 글 → 안심의 여정 → 문의 → 실제 반응 → 정체성 공개 */
const WORDS = [
  { label: 'Search.', at: 5, z: -860, exitZ: 420, size: 'small' },
  { label: 'Read.', at: 27, z: -760, exitZ: 420, size: 'small', y: 270 },
  { label: 'Trust.', at: 48, z: -900, exitZ: 500, size: 'hero' },
]

// 고객의 속마음(미발화) — 어두운 생각 말풍선으로 흩어진다.
// 뒤쪽 실제 문의(흰 말풍선)와 색·형태로 구분해 "고민 → 문의" 서사를 만든다.
// 좁은 화면은 클러스터가 가로로 압축돼 긴 문장이 겹친다 —
// 긴 3개(hideMobile)는 모바일에서 숨겨 5개만 노출한다.
const INSIGHTS = [
  { label: '괜찮을까?', x: -34, y: -28 },
  { label: '너무 비싼데', x: 30, y: -30 },
  { label: '후기가 진짜일까', x: -40, y: 6, hideMobile: true },
  { label: '다른 곳도 볼까', x: 38, y: 12, hideMobile: true },
  { label: '믿어도 될까', x: -12, y: -44 },
  { label: '지금 문의해도 되나', x: 4, y: 40, hideMobile: true },
  { label: '실패하면?', x: 34, y: 36 },
  { label: '예약해볼까', x: -30, y: 34 },
]

const JOURNEY_NODES = ['고민', '탐색', '읽음', '안심', '문의']

const MESSAGE_BUBBLES = [
  '글 보고 문의드려요.\n처음이라 몇 가지만 여쭤보고 싶어요.',
  '제 상황이랑 비슷해서요.\n상담 가능할까요?',
  '후기까지 보고 연락드립니다.\n이번 주 예약 가능할까요?',
]

/* 고객 문의 캡처 — src/assets/reaction/ 폴더의 reactionNN.* 을 자동 연결.
   파일만 추가하면 필드에 반영된다 (확장자·대소문자 무관) */
const reactionModules = import.meta.glob('../../../assets/reaction/reaction*', {
  eager: true,
  import: 'default',
})
const REACTION_IMAGES = Object.entries(reactionModules)
  .map(([path, url]) => {
    const match = path.match(/reaction-?0*(\d+)/i)
    return match ? { num: parseInt(match[1], 10), url } : null
  })
  .filter(Boolean)
  .sort((a, b) => a.num - b.num)
  .map((item) => item.url)

/* 정체성 필러 카드 — src/assets/pillars/ 폴더에 pillar-1~3.png 을 넣으면
   자동 연결 (확장자 무관). 1 = MARKETING, 2 = WEB, 3 = 자동화. 없으면 라벨만 */
const PILLARS = ['MARKETING', 'WEB', '자동화']
const pillarModules = import.meta.glob('../../../assets/pillars/*', {
  eager: true,
  import: 'default',
})
const pillarImageByNum = {}
for (const [path, url] of Object.entries(pillarModules)) {
  const match = path.match(/pillar-?(\d+)/i)
  if (!match) continue
  const num = parseInt(match[1], 10)
  const isRaster = /\.(png|jpe?g|webp)$/i.test(path)
  if (isRaster || !pillarImageByNum[num]) pillarImageByNum[num] = url
}

/* 문의 이미지 모자이크 벽 — 4x4 그리드에 지터를 더한 고정 배치 */
const MOSAIC = REACTION_IMAGES.map((url, i) => {
  const col = i % 4
  const row = Math.floor(i / 4)
  return {
    url,
    x: -36 + col * 24 + (((i * 7) % 9) - 4),
    y: -33 + row * 22 + (((i * 5) % 9) - 4),
    rot: ((i * 13) % 11) - 5,
    h: 20 + ((i * 9) % 14),
    order: (i * 7) % 16,
  }
})

function Reaction() {
  const sectionRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // 모바일에서 preload가 미뤄지면 첫 프레임이 없어 poster(배 없는 바다)만 남는다 —
  // 인트로 뒤에서 play→pause 한 번으로 로딩·첫 프레임 디코드를 강제한다
  useEffect(() => {
    const video = sectionRef.current?.querySelector('video')
    if (!video) return
    let done = false
    const kick = () => {
      if (done) return
      const p = video.play()
      if (p && p.then) {
        p.then(() => {
          done = true
          video.pause()
          video.currentTime = 0
        }).catch(() => {}) // 자동재생 차단 시 첫 터치에서 재시도
      }
    }
    kick()
    window.addEventListener('touchstart', kick, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', kick)
  }, [])

  useEffect(() => {
    if (reduced) return

    const ctx = gsap.context(() => {
      const root = sectionRef.current
      const q = (cls) => root.querySelector(`.${cls}`)
      const insightMap = q(styles.insightMap)
      const insightCaption = q(styles.insightCaption)
      const seaScene = q(styles.seaScene)
      const seaPhoto = q(styles.seaImg)
      const seaShade = q(styles.seaShade)
      const nightRise = q(styles.nightRise)
      const fogs = gsap.utils.toArray(`.${styles.fog}`, root)
      const contentCard = q(styles.contentCard)
      const journeyPath = q(styles.journeyPath)
      const journeyLine = q(styles.journeyLine)
      const traveler = q(styles.traveler)
      const messageLayer = q(styles.messageLayer)
      const signals = gsap.utils.toArray(`.${styles.signal}`, root)
      const journeyNodes = gsap.utils.toArray(`.${styles.journeyNode}`, root)
      const messageBubbles = gsap.utils.toArray(`.${styles.messageBubble}`, root)
      const words = gsap.utils.toArray(`.${styles.word}`, root)
      const wallLayer = q(styles.wallLayer)
      const wallImgs = gsap.utils.toArray(`.${styles.wallImg}`, root)
      const reactionWord = q(styles.reactionWord)
      const slogan = q(styles.slogan)
      const identity = q(styles.identity)
      const nameChars = gsap.utils.toArray(`.${styles.nameChar}`, root)
      const nameBar = q(styles.nameBar)
      const watermark = q(styles.watermark)
      const hint = q(styles.scrollHint)
      const pillarEls = gsap.utils.toArray(`.${styles.pillar}`, root)

      gsap.set(insightMap, { xPercent: -50, yPercent: -50, z: 0, autoAlpha: 1 })
      gsap.set(insightCaption, { xPercent: -50, autoAlpha: 0, y: 10 })
      gsap.set(seaPhoto, { scale: 1.02, transformOrigin: '50% 62%' })
      gsap.set(nightRise, { yPercent: 100 })
      gsap.set(fogs, { autoAlpha: 1 })
      gsap.set(contentCard, {
        xPercent: -50,
        yPercent: -50,
        y: 30,
        scale: 0.86,
        autoAlpha: 0,
      })
      gsap.set(journeyPath, { xPercent: -50, yPercent: -50, y: 70, autoAlpha: 0 })
      gsap.set(journeyLine, { scaleX: 0, transformOrigin: '0 50%' })
      // 라인 좌우 8% 인셋에 맞춘 이동 반경 — 노드 크기가 커져도 폭에 비례해 따라간다
      const travelX = (journeyPath?.offsetWidth || 560) * 0.42
      gsap.set(traveler, { xPercent: -50, yPercent: -50, x: -travelX, autoAlpha: 0 })
      gsap.set(journeyNodes, { y: 14, autoAlpha: 0 })
      gsap.set(messageLayer, { xPercent: -50, yPercent: -50, y: 35, autoAlpha: 0 })
      gsap.set(messageBubbles, { y: 28, scale: 0.92, autoAlpha: 0 })
      // 말풍선은 각자 제자리에 숨어 있다가, 하나씩 랜덤으로 팝(튀어나옴)한다
      signals.forEach((el, i) => {
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: `${INSIGHTS[i].x * 0.55}vw`,
          y: `${INSIGHTS[i].y * 0.55}vh`,
          scale: 0.4,
          autoAlpha: 0,
        })
      })
      gsap.set(words, { xPercent: -50, yPercent: -50, z: -1200, autoAlpha: 0 })
      gsap.set(wallLayer, { z: 0, autoAlpha: 1 })
      wallImgs.forEach((el, i) => {
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          z: -520,
          rotation: MOSAIC[i].rot,
          autoAlpha: 0,
        })
      })
      gsap.set(reactionWord, { xPercent: -50, yPercent: -50, z: -1400, autoAlpha: 0 })
      gsap.set(slogan, { xPercent: -50, yPercent: -50, y: 24, autoAlpha: 0 })
      gsap.set(identity, { y: 30, autoAlpha: 0 })
      gsap.set(nameChars, { y: 44, autoAlpha: 0 })
      gsap.set(nameBar, { scaleX: 0 })
      gsap.set(watermark, { xPercent: -50, yPercent: -50, z: -600, autoAlpha: 0 })
      gsap.set(pillarEls, { y: 40, autoAlpha: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=900%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      tl.to(hint, { autoAlpha: 0, duration: 4 }, 0)
      // 캡션(라벨)이 가장 먼저 뜬다 → Search.(5) → 그다음 말풍선들이 하나씩 팝
      tl.to(insightCaption, { autoAlpha: 1, y: 0, duration: 4, ease: 'power2.out' }, 1)
      // 속마음 말풍선 — Search. 뒤에 하나씩 랜덤으로 팝(튀어나옴)했다가, 다음이 뜨면
      // 스르륵 사라진다. 한 화면에 1~2개만 → 2배로 키워도 겹치지 않는다.
      // 순열은 고정(스크럽 결정성 유지)
      const POP_ORDER = [3, 0, 6, 1, 7, 4, 2, 5]
      POP_ORDER.forEach((idx, rank) => {
        if (!signals[idx]) return
        const at = 8 + rank * 1.3
        tl.fromTo(
          signals[idx],
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(1.8)' },
          at,
        )
        // 팝 뒤 더 오래 머문 다음(1.7) 완만하게 사라진다 — "사라지는 속도가 빠르다" 피드백 반영해 페이드 연장
        tl.to(
          signals[idx],
          { autoAlpha: 0, scale: 0.9, duration: 2.8, ease: 'none' },
          at + 1.7,
        )
      })
      // 카메라 푸시인 — 안개 걷힘과 함께 바다로 서서히 다가간다
      tl.to(seaPhoto, { scale: 1.12, duration: 22, ease: 'none' }, 0)

      // 스크롤 → 영상 재생 시간 매핑 — 바다가 보이는 구간(0~58) 전체에 6초를 편다
      const videoScrub = { p: 0 }
      tl.to(videoScrub, {
        p: 1,
        duration: 58,
        ease: 'none',
        onUpdate: () => {
          if (seaPhoto.duration) {
            seaPhoto.currentTime = seaPhoto.duration * videoScrub.p
          }
        },
      }, 0)
      tl.to(seaShade, { opacity: 0.82, duration: 12, ease: 'power1.out' }, 8)

      // 안개 걷힘 — 레이어별로 좌우로 흘러가며 옅어진다
      fogs.forEach((fog, i) => {
        tl.to(fog, {
          xPercent: i % 2 ? -14 : 12,
          autoAlpha: 0,
          duration: 6 + i * 1.5,
          ease: 'power1.inOut',
        }, 8 + i * 3)
      })

      // 캡션은 말풍선이 다 스쳐갈 때까지 라벨로 머물다, 마지막 팝 뒤 걷힌다
      tl.to(insightCaption, { autoAlpha: 0, y: -12, duration: 4, ease: 'power1.in' }, 19.5)

      tl.to(contentCard, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 8,
        ease: 'power2.out',
      }, 20)
      tl.to(contentCard, {
        y: -58,
        scale: 0.92,
        autoAlpha: 0.78,
        duration: 8,
        ease: 'power1.inOut',
      }, 34)

      tl.to(journeyPath, { y: 0, autoAlpha: 1, duration: 5, ease: 'power2.out' }, 38)
      tl.to(journeyLine, { scaleX: 1, duration: 11, ease: 'power1.inOut' }, 40)
      // 노드는 이동 점이 지나가는 타이밍에 맞춰 하나씩 뜬다
      tl.to(journeyNodes, {
        y: 0,
        autoAlpha: 1,
        duration: 2.4,
        stagger: 2.1,
        ease: 'power1.out',
      }, 41.5)
      tl.to(traveler, { autoAlpha: 1, duration: 1.4 }, 41)
      tl.to(traveler, { x: travelX, duration: 10, ease: 'power1.inOut' }, 42)
      tl.to(contentCard, { autoAlpha: 0, y: -90, duration: 5 }, 46)
      // 여정 전체가 떠오르듯 페이드아웃 — 다음 문자 장면으로 자연스럽게
      tl.to(journeyPath, { y: -28, autoAlpha: 0, duration: 3, ease: 'power1.in' }, 52.5)

      tl.to(messageLayer, { y: 0, autoAlpha: 1, duration: 4, ease: 'power2.out' }, 54)
      tl.to(messageBubbles, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 3,
        stagger: 2.2,
        ease: 'back.out(1.4)',
      }, 56)
      tl.to(insightMap, { z: 180, autoAlpha: 0, duration: 5, ease: 'power1.in' }, 64)
      // 검은 밤이 아래에서 차올라 바다를 덮는다 — 배경 급전환 방지 와이프
      tl.to(nightRise, { yPercent: 0, duration: 6, ease: 'power1.inOut' }, 60)
      tl.set(seaScene, { autoAlpha: 0 }, 67) // 완전히 덮인 뒤 합성 부담 제거
      tl.to(messageLayer, { y: -24, autoAlpha: 0, duration: 4 }, 66)

      // 세로가 넉넉한 폰에선 Search.가 배 그래픽·하단 키워드와 겹쳐 답답 — 살짝 위로 올린다.
      // (짧은 화면은 캡션↔Search 공간이 부족해 올리지 않는다; CSS 캡션 위치와 조건 일치)
      const narrow = window.matchMedia('(max-width: 768px) and (min-height: 720px)').matches
      words.forEach((word, i) => {
        const item = WORDS[i]
        const baseY = item.y ?? 0
        const y = narrow && item.label === 'Search.' ? baseY - 40 : baseY
        tl.set(word, { y, z: item.z }, item.at - 0.1)
        tl.to(word, { z: 0, autoAlpha: 1, duration: 2.2, ease: 'power1.out' }, item.at)
        tl.to(word, { z: item.exitZ, autoAlpha: 0, duration: 2.2, ease: 'power1.in' }, item.at + 4.6)
      })

      const WALL_START = 68
      const WALL_FILL = 10
      const SETTLE = 1.7
      const step =
        wallImgs.length > 1 ? (WALL_FILL - SETTLE) / (wallImgs.length - 1) : 0
      const ranked = MOSAIC.map((_, i) => i).sort(
        (a, b) => MOSAIC[a].order - MOSAIC[b].order,
      )
      ranked.forEach((imgIndex, rank) => {
        const at = WALL_START + rank * step
        tl.to(wallImgs[imgIndex], { autoAlpha: 1, duration: 0.8 }, at)
        tl.to(
          wallImgs[imgIndex],
          { z: 0, duration: SETTLE, ease: 'back.out(1.3)' },
          at,
        )
      })

      tl.to(wallLayer, { z: -140, autoAlpha: 0.22, duration: 4, ease: 'power1.inOut' }, 78)
      tl.to(reactionWord, { z: 0, autoAlpha: 1, duration: 5, ease: 'power2.out' }, 78)
      tl.to(wallLayer, { autoAlpha: 0, duration: 3 }, 84)
      tl.to(reactionWord, { y: -30, autoAlpha: 0, duration: 2.2 }, 84.5)

      tl.to(slogan, { y: 0, autoAlpha: 1, duration: 3, ease: 'power1.out' }, 86)
      tl.to(slogan, { y: -20, autoAlpha: 0, duration: 2.5 }, 91.5)

      tl.to(watermark, { autoAlpha: 1, duration: 5, ease: 'power1.out' }, 92)
      tl.to(identity, { y: 0, autoAlpha: 1, duration: 3, ease: 'power1.out' }, 92)
      tl.to(
        nameChars,
        { y: 0, autoAlpha: 1, duration: 2.4, stagger: 0.7, ease: 'power2.out' },
        92.5,
      )
      tl.to(nameBar, { scaleX: 1, duration: 2, ease: 'power2.out' }, 94.8)
      tl.to(
        pillarEls,
        { y: 0, autoAlpha: 1, duration: 3.2, stagger: 0.7, ease: 'power1.out' },
        95,
      )
      tl.to({}, { duration: 0.5 })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

  if (reduced) {
    return (
      <section className={styles.staticWrap}>
        <div>
          <p className={styles.staticSlogan}>Every reaction has a reason.</p>
          <div className={styles.identityStatic}>
            <p className={styles.tagline}>반응을 읽는 마케터</p>
            <p className={styles.name}>추민석</p>
            <span className={styles.nameBar} aria-hidden="true" />
            <Pillars />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={styles.reaction}>
      <div className={styles.viewport}>
        {/* 장면 1: 안개 낀 바다 — 스크롤이 항해 영상의 재생 시간을 직접 구동한다 */}
        <div className={styles.seaScene} aria-hidden="true">
          <video
            className={styles.seaImg}
            src={seaVideo}
            poster={seaImg}
            muted
            playsInline
            preload="auto"
          />
          <div className={styles.seaShade} />
          <span className={`${styles.fog} ${styles.fog1}`} />
          <span className={`${styles.fog} ${styles.fog2}`} />
          <span className={`${styles.fog} ${styles.fog3}`} />
        </div>

        {/* 장면 전환: 검은 밤이 아래에서 차올라 바다를 덮는다 (버블 장면 뒤, 모자이크 장면 앞) */}
        <div className={styles.nightRise} aria-hidden="true" />

        <div className={styles.insightMap}>
          <p className={styles.insightCaption}>고객이 문의 전에 망설이는 것들</p>
          {INSIGHTS.map((item) => (
            <span
              key={item.label}
              className={`${styles.signal} ${item.hideMobile ? styles.signalDeskOnly : ''}`}
            >
              <span className={styles.signalLabel}>{item.label}</span>
            </span>
          ))}
        </div>

        <article className={styles.contentCard}>
          <p>문의 전 망설임을 먼저 읽고</p>
          <h2>그 망설임에,<br />먼저 답합니다.</h2>
          <ul>
            <li>처음이라 뭐부터 물어야 할지</li>
            <li>나한테도 맞는 건지</li>
            <li>지금 연락해도 되는지</li>
          </ul>
        </article>

        <div className={styles.journeyPath}>
          <span className={styles.journeyLine} />
          <span className={styles.traveler} />
          {JOURNEY_NODES.map((node) => (
            <span key={node} className={styles.journeyNode}>
              {node}
            </span>
          ))}
        </div>

        <div className={styles.messageLayer}>
          {MESSAGE_BUBBLES.map((message) => (
            <p key={message} className={styles.messageBubble}>
              {message.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          ))}
        </div>

        <div className={styles.stage3d}>
          {WORDS.map((word) => (
            <p
              key={word.label}
              className={`${styles.word} ${word.size === 'hero' ? styles.wordHero : styles.wordSmall}`}
            >
              {word.label.slice(0, -1)}
              <span className={styles.dot}>.</span>
            </p>
          ))}
        </div>

        <div className={styles.wallLayer}>
          {MOSAIC.map((item, i) => (
            <img
              key={i}
              className={styles.wallImg}
              src={item.url}
              alt=""
              style={{
                left: `${50 + item.x}%`,
                top: `${50 + item.y}%`,
                height: `${item.h}vh`,
              }}
            />
          ))}
        </div>

        <p className={styles.reactionWord}>
          Reaction<span className={styles.dot}>.</span>
        </p>
        <p className={styles.slogan}>
          Every reaction has a reason<span className={styles.dot}>.</span>
        </p>
        <p className={styles.watermark} aria-hidden="true">
          CHU MIN SEOK
        </p>
        <div className={styles.identity}>
          <p className={styles.tagline}>반응을 읽는 마케터</p>
          <p className={styles.name} aria-label="추민석">
            {'추민석'.split('').map((char, i) => (
              <span key={i} className={styles.nameChar} aria-hidden="true">
                {char}
              </span>
            ))}
          </p>
          <span className={styles.nameBar} aria-hidden="true" />
          <Pillars />
        </div>

        {/* 스크롤 유도 버튼 — 클릭하면 한 화면만큼 내려간다. 페이드아웃은 기존 타임라인이 관리 */}
        <button
          type="button"
          className={styles.scrollHint}
          aria-label="아래로 스크롤"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          SCROLL
          <span className={styles.scrollChevron} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <div className={styles.pillars}>
      {PILLARS.map((label, i) => (
        <div key={label} className={styles.pillar}>
          {pillarImageByNum[i + 1] ? (
            <>
              <img src={pillarImageByNum[i + 1]} alt={label} />
              <span className={styles.pillarLabel}>{label}</span>
            </>
          ) : (
            label
          )}
        </div>
      ))}
    </div>
  )
}

export default Reaction
