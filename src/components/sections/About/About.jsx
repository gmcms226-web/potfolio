import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.css'

gsap.registerPlugin(ScrollTrigger)

/* 일러스트 이미지 — src/assets/values/ 폴더에
   value-1.png ~ value-4.png 를 넣으면 자동으로 아이콘을 대체 (확장자 무관)
   1 = 관찰, 2 = 기획, 3 = 성장, 4 = 연결. 없으면 기본 라인 아이콘 표시 */
const valueModules = import.meta.glob('../../../assets/values/*', {
  eager: true,
  import: 'default',
})
const valueImageByNum = {}
for (const [path, url] of Object.entries(valueModules)) {
  const match = path.match(/value-?(\d+)/i)
  if (match) valueImageByNum[parseInt(match[1], 10)] = url
}

/* 나를 설명하는 네 가지 가치 — 문구는 자유롭게 수정 */
const VALUES = [
  {
    ko: '관찰',
    en: 'Observation',
    desc: '데이터와 반응을 관찰하며 콘텐츠의 기회를 탐구합니다.',
    icon: 'compass',
  },
  {
    ko: '기획',
    en: 'Planning',
    desc: '사용자의 입장에서 생각하고, 읽히는 콘텐츠를 설계합니다.',
    icon: 'bulb',
  },
  {
    ko: '성장',
    en: 'Growth',
    desc: '감이 아니라 숫자로 증명되는 성장을 만듭니다.',
    icon: 'graph',
  },
  {
    ko: '연결',
    en: 'Connection',
    desc: 'AI 워크플로우로 콘텐츠와 웹, 사람과 브랜드를 연결합니다.',
    icon: 'nodes',
  },
]

/* 레퍼런스(values-section)와 동일한 구조:
   - 섹션을 화면에 고정(pin)하고 슬라이드 수 × 300% 만큼 스크럽
   - 슬라이드가 순서대로 크로스페이드로 덮이며
   - 일러스트는 scale 0.6 / y+300 에서 떠오르고
   - 텍스트는 clip-path 와이프로 왼쪽→오른쪽 닦이며 등장 */
function About() {
  const sectionRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced) return

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray(`.${styles.slide}`)
      const allText = gsap.utils.toArray(`.${styles.reveal}`)

      gsap.set(allText, { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
      if (slides.length > 1) {
        gsap.set(slides.slice(1), { autoAlpha: 0 })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          // 슬라이드당 150% — 210%(2026-07-09 확대)는 About→Projects가 너무 길다는
          // 피드백으로 축소 (2026-07-22). + 85%는 마지막 퇴장 챕터(축소·페이드) 몫.
          end: `+=${slides.length * 150 + 85}%`,
          pin: true,
          scrub: 1.1,
          anticipatePin: 1,
        },
      })

      slides.forEach((slide, index) => {
        const illustration = slide.querySelector(`.${styles.illustration}`)
        const label = slide.querySelector(`.${styles.label}`)
        const titles = slide.querySelectorAll(
          `.${styles.title}, .${styles.subtitle}`,
        )
        const descriptions = slide.querySelectorAll(
          `.${styles.pagination}, .${styles.desc}`,
        )

        gsap.set(slide, { zIndex: 10 + index })

        // 다음 슬라이드가 이전 슬라이드 위로 크로스페이드
        if (index > 0) {
          tl.to(slide, { autoAlpha: 1, duration: 4, ease: 'power1.inOut' })
        }

        // 일러스트: 아래에서 커지며 떠오른다
        tl.fromTo(
          illustration,
          { scale: 0.6, y: 300 },
          { scale: 1, y: 0, duration: 4, ease: 'power1.out' },
        )

        // 텍스트: clip-path 와이프 — 라벨 → 타이틀 → 설명 순서
        tl.to(
          label,
          { clipPath: 'inset(0 0% 0 0)', duration: 4, ease: 'power1.out' },
          '>',
        )
          .to(
            titles,
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 4,
              ease: 'power1.out',
              stagger: 0.8,
            },
            '> 0.3',
          )
          .to(
            descriptions,
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 4,
              ease: 'power1.out',
              stagger: 0.8,
            },
            '> 0.3',
          )

        // 완성된 화면에서 잠시 머무른다
        tl.to({}, { duration: 1.5 })
      })

      // 퇴장(섹션 스택 전환): 이미 pin된 상태를 활용해 새 pin 없이
      // 화면 전체가 물러나며 어두워지고, pin이 풀리면 다음 섹션(작업물 터널)으로
      tl.to(sectionRef.current, {
        scale: 0.7,
        autoAlpha: 0.5,
        duration: 7,
        ease: 'none',
      }).to(sectionRef.current, { autoAlpha: 0, duration: 1.5 })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      className={reduced ? styles.staticList : styles.about}
    >
      {VALUES.map((v, i) => (
        <div key={v.ko} className={styles.slide}>
          <div className={styles.inner}>
            <div className={styles.left}>
              <p className={`${styles.label} ${styles.reveal}`}>ABOUT</p>
              <h3 className={`${styles.title} ${styles.reveal}`}>{v.ko}</h3>
              <p className={`${styles.subtitle} ${styles.reveal}`}>{v.en}</p>
              <p className={`${styles.pagination} ${styles.reveal}`}>
                {String(i + 1).padStart(2, '0')} /{' '}
                {String(VALUES.length).padStart(2, '0')}
              </p>
              <p className={`${styles.desc} ${styles.reveal}`}>{v.desc}</p>
            </div>
            <div className={styles.right}>
              <div className={styles.illustration}>
                {valueImageByNum[i + 1] ? (
                  <img src={valueImageByNum[i + 1]} alt={`${v.ko} 일러스트`} />
                ) : (
                  <Icon name={v.icon} />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

/* 미니멀 라인 아이콘 — stroke 기반, 테마 색상을 따라간다 */
function Icon({ name }) {
  const common = {
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (name === 'compass') {
    // 나침반 — 탐구
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="22" />
        <polygon points="40,24 35,35 24,40 29,29" />
        <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
        <line x1="32" y1="6" x2="32" y2="10" />
        <line x1="32" y1="54" x2="32" y2="58" />
        <line x1="6" y1="32" x2="10" y2="32" />
        <line x1="54" y1="32" x2="58" y2="32" />
      </svg>
    )
  }

  if (name === 'bulb') {
    // 전구 — 사용자 입장에서 생각
    return (
      <svg {...common}>
        <path d="M32 10c-9 0-15 6.5-15 14.5 0 5.5 3 9 6 12.5 1.8 2.1 3 4.5 3 7h12c0-2.5 1.2-4.9 3-7 3-3.5 6-7 6-12.5C47 16.5 41 10 32 10Z" />
        <line x1="27" y1="50" x2="37" y2="50" />
        <line x1="29" y1="55" x2="35" y2="55" />
        <path d="M28 36c0-4 1.5-6 4-6s4 2 4 6" />
      </svg>
    )
  }

  if (name === 'graph') {
    // 상향 곡선 — 성장
    return (
      <svg {...common}>
        <polyline points="10,54 10,10" />
        <polyline points="10,54 54,54" />
        <path d="M14 48c10-2 16-6 22-14 4.5-6 8-10 14-13" />
        <polyline points="44,20 50,21 49,27" />
      </svg>
    )
  }

  // nodes — 연결 (AI workflow)
  return (
    <svg {...common}>
      <circle cx="16" cy="20" r="6" />
      <circle cx="48" cy="16" r="6" />
      <circle cx="20" cy="48" r="6" />
      <circle cx="46" cy="44" r="7" />
      <line x1="22" y1="22" x2="42" y2="17" />
      <line x1="18" y1="26" x2="19" y2="42" />
      <line x1="25" y1="45" x2="39" y2="44" />
      <line x1="47" y1="22" x2="46" y2="37" />
    </svg>
  )
}

export default About
