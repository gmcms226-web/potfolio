import { useEffect, useRef, useState } from 'react'
import styles from './Record.module.css'

/* 숫자로 보는 반응 — 앞의 문의 벽·정체성 공개에 이어지는 "증거" 섹션.
   pin 없이 Intersection Observer + 카운트업만 사용 (POV 섹션과 같은 문법).
   pin 섹션(Reaction ↔ About) 사이의 자유 스크롤 구간 역할도 겸한다 */

const COUNT_DURATION = 1600 // 카운트업(ms)

const STATS = [
  {
    value: 8,
    suffix: '년+',
    label: '온라인 마케팅 경력',
    desc: '바이럴 마케팅 · 온라인 콘텐츠 운영 실무',
  },
  {
    value: 101,
    suffix: '건',
    label: '4개월간 유치한 문의',
    desc: '입시 콘텐츠 — 블로그 · 카페 · 포스트 · 티스토리 동시 운영',
  },
  {
    value: 1000,
    suffix: '만+',
    label: '콘텐츠 하나로 만든 매출',
    desc: '에듀윌 자격증 — 맘카페 콘텐츠 기획 · 디자인 · 작성 단독 수행',
  },
  {
    value: 5,
    suffix: '개',
    label: '동시 운영 블로그 채널',
    desc: '키워드 분석 기반 검색 최적화 · 과목별 학습 콘텐츠',
  },
]

const NOTES = [
  '네이버 블로그 콘텐츠 단독으로 기관(B2B) 토익 교육 문의를 유치 — 계약 협의 단계까지 진행',
  '입시 전담팀 팀장 — 성과가 저조한 팀원의 키워드·콘텐츠 방향을 코칭, 2주 만에 실제 문의 발생',
]

/* Capabilities — 숫자 증거에 이어지는 역량·경력 요약.
   정체성 공개(Reaction) → 숫자(위 스탯) → 다루는 무기 순서로 증거를 완성한다 */
const CAPABILITIES = [
  {
    title: 'MARKETING',
    items: [
      '바이럴 · 콘텐츠 마케팅',
      'SNS 채널 운영',
      '네이버 블로그 · 카페 / 티스토리',
      '문의 상담 · 전환 관리',
    ],
  },
  {
    title: 'WEB',
    items: ['HTML · CSS · JavaScript', 'React · Firebase', 'Figma · UI/UX 디자인'],
  },
  {
    title: 'AUTOMATION',
    items: ['ChatGPT · Claude', 'Make 워크플로우'],
  },
]

const CAREER = [
  ['경력', '동화세상에듀코 콘텐츠 마케팅 8년 · ㈜예람 인턴 2개월'],
  ['프로젝트', '아이몽펫 애견미용실 로컬 마케팅 단독 운영 — 콘텐츠로 문의·예약 전환 창출'],
  ['교육', '그린아트컴퓨터학원 AI 바이브코딩 웹비즈니스 구축·마케팅 실전과정 수료'],
  ['자격', '광고기획전문가 · 마케팅조사분석사'],
]

/* 화면에 들어오는 순간 0 → 목표값으로 감속 카운트업 */
function useCountUp(target, start) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setValue(target)
      return
    }

    let raf
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / COUNT_DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target])

  return value
}

function Stat({ stat, start, index }) {
  const value = useCountUp(stat.value, start)

  return (
    <div
      className={`${styles.stat} ${start ? styles.visible : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <p className={styles.number}>
        {value.toLocaleString()}
        <span className={styles.suffix}>{stat.suffix}</span>
      </p>
      <p className={styles.label}>{stat.label}</p>
      <p className={styles.desc}>{stat.desc}</p>
    </div>
  )
}

function Record() {
  const sectionRef = useRef(null)
  const capsRef = useRef(null)
  const [started, setStarted] = useState(false)
  const [capsStarted, setCapsStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStarted(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.35 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Capabilities는 스탯보다 아래에 있어 별도 관찰 — 화면에 들어올 때 등장
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCapsStarted(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.25 },
    )
    if (capsRef.current) observer.observe(capsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={styles.record}>
      <div className={styles.inner}>
        <div className={`${styles.header} ${started ? styles.visible : ''}`}>
          <p className={styles.eyebrow}>TRACK RECORD</p>
          <h2>숫자로 보는 반응</h2>
        </div>

        <div className={styles.grid}>
          {STATS.map((stat, i) => (
            <Stat key={stat.label} stat={stat} start={started} index={i} />
          ))}
        </div>

        <ul className={styles.notes}>
          {NOTES.map((note, i) => (
            <li
              key={note}
              className={`${styles.note} ${started ? styles.visible : ''}`}
              style={{ transitionDelay: `${0.5 + i * 0.12}s` }}
            >
              {note}
            </li>
          ))}
        </ul>

        <div ref={capsRef} className={styles.capabilities}>
          <p
            className={`${styles.eyebrow} ${styles.capReveal} ${capsStarted ? styles.visible : ''}`}
          >
            CAPABILITIES
          </p>
          <div className={styles.capGrid}>
            {CAPABILITIES.map((group, i) => (
              <div
                key={group.title}
                className={`${styles.capCol} ${styles.capReveal} ${capsStarted ? styles.visible : ''}`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              >
                <h3>
                  {group.title}
                  <span className={styles.capDot}>.</span>
                </h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <dl
            className={`${styles.capMeta} ${styles.capReveal} ${capsStarted ? styles.visible : ''}`}
            style={{ transitionDelay: '0.4s' }}
          >
            {CAREER.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export default Record
