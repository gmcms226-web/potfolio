import { useEffect, useRef } from 'react'
import styles from './SiteHeader.module.css'

/* 미니 고정 헤더 — 오프닝이 끝나면 나타나 이름이 항상 상주한다.
   mix-blend-mode: difference 로 다크/라이트 섹션 어디서든 글자가 반전되어 보인다.
   상단의 얇은 진행바는 긴 스크롤 사이트에서 현재 위치를 알려주는 몰입 유지 장치 */
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
  const goContact = () =>
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <div className={styles.progressWrap} aria-hidden="true">
        <div ref={barRef} className={styles.progress} />
      </div>
      <header className={`${styles.header} ${visible ? styles.visible : ''}`}>
        <button type="button" className={styles.brand} onClick={goTop}>
          추민석 <span className={styles.brandSub}>— 반응을 읽는 마케터</span>
        </button>
        <button type="button" className={styles.contactBtn} onClick={goContact}>
          CONTACT
        </button>
      </header>
    </>
  )
}

export default SiteHeader
