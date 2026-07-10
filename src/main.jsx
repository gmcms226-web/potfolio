import React from 'react'
import ReactDOM from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.jsx'
import './styles/tokens.css'
import './styles/global.css'

gsap.registerPlugin(ScrollTrigger)

// 새로고침 시 스크롤 위치 복원 차단 — 반드시 렌더 전에 실행한다.
// clearScrollMemory('manual')은 두 가지를 한 번에 처리한다:
//  1) history.scrollRestoration = 'manual' (브라우저의 지연 복원 차단)
//  2) ScrollTrigger가 자체 기억한 이전 스크롤 위치 제거
//     (이게 남아 있으면 refresh() 시점에 새로고침 전 위치로 점프해버린다)
ScrollTrigger.clearScrollMemory('manual')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
