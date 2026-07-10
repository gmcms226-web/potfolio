import { useEffect, useRef } from 'react'
import styles from './Contact.module.css'

/* 마지막 섹션 — 초대형 타이포 피날레.
   앞의 검은 POV 섹션이 pin된 채 축소·페이드되는 동안
   이 섹션이 위를 덮으며 올라온다 (섹션 스택 전환의 종점).
   연출은 Intersection Observer + CSS transition만 사용 — GSAP 없음 */
const EMAIL = 'gmcms226@gmail.com'
const PHONE = '010-9902-4672'

function Contact() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const targets = sectionRef.current?.querySelectorAll(`.${styles.reveal}`)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    targets?.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className={styles.contact}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>CONTACT</p>
        <h2 className={`${styles.headline} ${styles.reveal}`}>
          Let&apos;s build
          <br />
          trust<span className={styles.dot}>.</span>
        </h2>
        <p className={`${styles.lead} ${styles.reveal}`}>
          사람은 좋은 경험을 기억합니다.
          <br />그 기억이 신뢰가 됩니다.
        </p>
        <a className={`${styles.email} ${styles.reveal}`} href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <a className={`${styles.phone} ${styles.reveal}`} href={`tel:${PHONE.replaceAll('-', '')}`}>
          {PHONE}
        </a>
      </div>

      <footer className={styles.footer}>
        <p>추민석 — 반응을 읽는 마케터</p>
        <p>© 2026</p>
      </footer>
    </section>
  )
}

export default Contact
