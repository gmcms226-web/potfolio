import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Intro from '../components/Intro/Intro'
import SiteHeader from '../components/SiteHeader/SiteHeader'
import Reaction from '../components/sections/Reaction/Reaction'
import Record from '../components/sections/Record/Record'
import About from '../components/sections/About/About'
import Hero from '../components/sections/Hero/Hero'
import Projects from '../components/sections/Projects/Projects'
import Contact from '../components/sections/Contact/Contact'

// 오프닝은 "실제 페이지 로드"당 한 번만 — 상세 페이지에 다녀와도 다시 재생하지 않고,
// 새로고침(F5)하면 다시 재생된다 (모듈 스코프 변수는 라우트 전환에는 유지되고
// 리로드에만 초기화되기 때문)
let openingPlayed = false

function Home() {
  const location = useLocation()
  const [showIntro, setShowIntro] = useState(() => !openingPlayed)
  const [introDone, setIntroDone] = useState(() => openingPlayed)

  // 오프닝으로 진입할 때는 항상 페이지 최상단에서 시작
  // (스크롤 복원 차단은 main.jsx 모듈 최상단 — 렌더 전에 실행되어야 한다)
  useEffect(() => {
    if (!openingPlayed) window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 연도 카운팅 오버레이 동안만 스크롤 잠금 — 이후는 전부 스크롤 주도.
  // 실제 스크롤 주체는 html(documentElement)이므로 반드시 둘 다 잠근다 —
  // body만 잠그면 오프닝 중 휠 입력에 페이지가 뒤에서 내려가 버린다
  useEffect(() => {
    const value = introDone ? '' : 'hidden'
    document.documentElement.style.overflow = value
    document.body.style.overflow = value
    if (introDone) {
      // 잠금 해제: ScrollTrigger의 스크롤 기억을 비우고(새로고침 전 위치로
      // 점프하는 것 방지), 맨 위를 강제한 뒤 다음 프레임에 pin 위치 재측정
      // (스크롤바가 다시 생기며 페이지 폭이 바뀌기 때문)
      ScrollTrigger.clearScrollMemory('manual')
      window.scrollTo(0, 0)
      requestAnimationFrame(() => ScrollTrigger.refresh())
    } else {
      window.scrollTo(0, 0)
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [introDone])

  // 상세 페이지에서 "메인으로" 복귀한 경우: 오프닝 없이 Projects 위치로 착지.
  // 잠금 효과(위)보다 뒤에 선언되어야 하고, 같은 프레임의 ScrollTrigger.refresh()가
  // 스크롤을 0으로 되돌리므로 refresh 이후(rAF)에 한 번 더 착지시킨다
  useEffect(() => {
    if (!(openingPlayed && location.state?.returnTo === 'projects')) return
    const jump = () => {
      const anchor = document.getElementById('projects-anchor')
      if (anchor) {
        window.scrollTo(0, anchor.getBoundingClientRect().top + window.scrollY)
      }
    }
    jump() // 즉시 이동 — 상단 화면이 깜빡 보이는 것 방지
    requestAnimationFrame(jump) // refresh 뒤 최종 착지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 안전장치: 어떤 이유로든 카운팅 완료 신호가 누락되면 강제로 잠금 해제
  useEffect(() => {
    if (introDone) return
    const timer = setTimeout(() => setIntroDone(true), 5000)
    return () => clearTimeout(timer)
  }, [introDone])

  return (
    <>
      {showIntro && (
        <Intro
          onLeaving={() => {
            openingPlayed = true
            setIntroDone(true)
          }}
          onFinish={() => setShowIntro(false)}
        />
      )}
      <SiteHeader visible={introDone} />
      <main>
        <Reaction />
        {/* 정체성 공개 직후의 증거 — 카운트업 지표 */}
        <Record />
        <About />
        {/* 작업물 터널 — Projects 진입 직전의 브릿지 */}
        <Hero />
        <div id="projects-anchor">
          <Projects />
        </div>
        <Contact />
      </main>
    </>
  )
}

export default Home
