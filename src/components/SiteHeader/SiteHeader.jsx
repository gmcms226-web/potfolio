import { useEffect, useRef } from 'react'
import styles from './SiteHeader.module.css'

/* 미니 고정 헤더 — 오프닝이 끝나면 나타나 이름이 항상 상주한다.
   mix-blend-mode: difference 로 다크/라이트 섹션 어디서든 글자가 반전되어 보인다.
   상단의 얇은 진행바는 긴 스크롤 사이트에서 현재 위치를 알려주는 몰입 유지 장치 */

// 스캐너(인사담당자)용 바로가기 — 시네마틱 연출 구간(Reaction·Hero)은 제외하고
// 판단에 필요한 곳만 의도 기반 라벨로 연결. 앵커 id는 Home.jsx의 래퍼 div
const NAV = [
  ['소개', 'about-anchor'],
  ['경력', 'record-anchor'],
  ['포트폴리오', 'projects-anchor'],
  ['문의', 'contact'],
]

function SiteHeader({ visible }) {
  const barRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const goTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <div className={styles.progressWrap} aria-hidden="true">
        <div ref={barRef} className={styles.progress} />
      </div>
      <header className={`${styles.header} ${visible ? styles.visible : ''}`}>
        <button type="button" className={styles.brand} onClick={goTop}>
          추민석 <span className={styles.brandSub}>— 반응을 읽는 마케터</span>
        </button>
        <nav className={styles.nav} aria-label="섹션 바로가기">
          {NAV.map(([label, id]) => (
            <button
              key={id}
              type="button"
              className={styles.navLink}
              onClick={() => goTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
    </>
  )
}

export default SiteHeader
