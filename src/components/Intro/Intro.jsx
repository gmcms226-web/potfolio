import { Component, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import styles from './Intro.module.css'

const START = { year: 2018, month: 1 }
const END = { year: 2026, month: 7 }
const TOTAL_MONTHS = (END.year - START.year) * 12 + (END.month - START.month)

/* 오프닝에서 유일한 자동 재생 — 연도 카운팅만 하고 곧바로 본문으로.
   인트로만 R3F(3D)로 렌더하고, 본문은 일반 React UI를 유지한다.
   연출 원칙: 카메라 이동 최소(미세 도리인), 깊이(fog + z 배치)로 공간감,
   과한 효과 없이 Apple 키노트처럼 절제 */
const COUNT_DURATION = 2 // 연도 카운팅(초) — 3D 클록 기준
const COUNT_HOLD = 300 // 2026.07 도달 후 머무는 시간(ms)
const BG = '#141413' // --color-bg 와 동일해야 전환 시 색 점프가 없다

/* 깊이감을 만드는 반투명 패널들 — 멀수록 흐리고 어둡다 (fog가 감쇠를 담당) */
const PANELS = [
  { x: -2.7, y: 0.9, z: -3, w: 1.7, h: 2.3, opacity: 0.55 },
  { x: 2.5, y: -0.7, z: -4.2, w: 1.9, h: 2.5, opacity: 0.48 },
  { x: -1.9, y: -1.4, z: -6, w: 2.2, h: 1.6, opacity: 0.4 },
  { x: 2.2, y: 1.5, z: -7.5, w: 2.4, h: 3, opacity: 0.32 },
  { x: -3.1, y: 0.2, z: -9.5, w: 2.6, h: 3.4, opacity: 0.24 },
  { x: 0.9, y: -1.9, z: -11.5, w: 3, h: 2, opacity: 0.18 },
  { x: -0.5, y: 2, z: -13.5, w: 3.4, h: 2.4, opacity: 0.12 },
]

const FONT_STACK =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', sans-serif"

function formatStep(step) {
  const total = START.month - 1 + step
  const year = START.year + Math.floor(total / 12)
  const month = (total % 12) + 1
  return `${year}.${String(month).padStart(2, '0')}`
}

/* 텍스트는 HTML 오버레이가 아니라 캔버스 텍스처 평면으로 —
   3D 공간(fog·패럴랙스)에 자연스럽게 섞이고, 웹폰트 로딩에도 의존하지 않는다 */
function makeTextCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, ctx: canvas.getContext('2d') }
}

/* 카운터: 숫자를 고정 폭 슬롯에 그려서 카운팅 중 좌우 흔들림을 없앤다
   (DOM 시절의 font-variant-numeric: tabular-nums 와 같은 역할) */
function drawCounter(ctx, label) {
  const { width, height } = ctx.canvas
  ctx.clearRect(0, 0, width, height)
  ctx.font = `700 150px ${FONT_STACK}`
  ctx.fillStyle = '#f5f5f2'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const slot = ctx.measureText('0').width * 1.06
  const dot = ctx.measureText('.').width
  const total = (label.length - 1) * slot + dot
  let x = (width - total) / 2
  for (const char of label) {
    const w = char === '.' ? dot : slot
    // 마침표는 포인트 컬러 — 본문의 "마침표 포인트" 모티프를 인트로부터 시작
    ctx.fillStyle = char === '.' ? '#ff4b33' : '#f5f5f2'
    ctx.fillText(char, x + w / 2, height / 2)
    x += w
  }
}

function CounterPlane({ onCountDone }) {
  const { texture, ctx } = useMemo(() => {
    const { canvas, ctx } = makeTextCanvas(1024, 320)
    drawCounter(ctx, formatStep(0))
    const texture = new THREE.CanvasTexture(canvas)
    return { texture, ctx }
  }, [])
  const startRef = useRef(-1)
  const lastLabel = useRef('')
  const doneRef = useRef(false)

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => {
    if (startRef.current < 0) startRef.current = clock.elapsedTime
    const progress = Math.min((clock.elapsedTime - startRef.current) / COUNT_DURATION, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out: 끝으로 갈수록 감속
    const label = formatStep(Math.round(eased * TOTAL_MONTHS))
    if (label !== lastLabel.current) {
      lastLabel.current = label
      drawCounter(ctx, label)
      texture.needsUpdate = true
    }
    if (progress >= 1 && !doneRef.current) {
      doneRef.current = true
      onCountDone()
    }
  })

  return (
    <mesh position={[0, -0.08, 0]}>
      <planeGeometry args={[4.2, 4.2 * (320 / 1024)]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

function CaptionPlane() {
  const texture = useMemo(() => {
    const { canvas, ctx } = makeTextCanvas(1024, 96)
    ctx.font = `500 40px ${FONT_STACK}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = '4px'
    ctx.fillStyle = 'rgba(245, 245, 242, 0.5)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // 카운터가 무슨 숫자인지 한 줄로 — 영어 라벨 대신 의미가 바로 읽히는 한국어
    ctx.fillText('사람의 반응을 읽어온 시간', canvas.width / 2, canvas.height / 2)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0, 0.72, 0]}>
      <planeGeometry args={[2.9, 2.9 * (96 / 1024)]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

/* 깊이 패널: 각자 위상이 다른 아주 느린 부유만 — 시선을 뺏지 않는 배경 */
function DepthPanels() {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    groupRef.current?.children.forEach((mesh, i) => {
      mesh.position.y = PANELS[i].y + Math.sin(t * 0.25 + i * 1.7) * 0.06
    })
  })

  return (
    <group ref={groupRef}>
      {PANELS.map((panel, i) => (
        <mesh key={i} position={[panel.x, panel.y, panel.z]}>
          <planeGeometry args={[panel.w, panel.h]} />
          <meshBasicMaterial
            color="#2a2a28"
            transparent
            opacity={panel.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* 카메라: 고정에 가깝게 — 아주 미세한 도리인 + 마우스 패럴랙스만 */
function Rig({ children }) {
  const groupRef = useRef()

  useFrame(({ camera, pointer }) => {
    camera.position.z += (5.7 - camera.position.z) * 0.012
    const group = groupRef.current
    if (group) {
      group.rotation.y += (pointer.x * 0.05 - group.rotation.y) * 0.05
      group.rotation.x += (-pointer.y * 0.03 - group.rotation.x) * 0.05
    }
  })

  return <group ref={groupRef}>{children}</group>
}

function IntroScene({ onCountDone }) {
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 7, 16]} />
      <Rig>
        <DepthPanels />
        <CaptionPlane />
        <CounterPlane onCountDone={onCountDone} />
      </Rig>
    </>
  )
}

/* WebGL 미지원/초기화 실패 시 DOM 카운터로 폴백 — 인트로가 절대 깨지지 않게 */
class GLBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* 3D 없이도 동작하는 DOM 카운터 (WebGL 폴백 + 모션 최소화 공용) */
function DomCounter({ animate, onCountDone }) {
  const [label, setLabel] = useState(
    animate ? formatStep(0) : formatStep(TOTAL_MONTHS),
  )

  useEffect(() => {
    if (!animate) {
      const timer = setTimeout(onCountDone, 600)
      return () => clearTimeout(timer)
    }

    let raf
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / (COUNT_DURATION * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setLabel(formatStep(Math.round(eased * TOTAL_MONTHS)))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else onCountDone()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.inner}>
      <p className={styles.caption}>사람의 반응을 읽어온 시간</p>
      <p className={styles.counter}>{label}</p>
    </div>
  )
}

function Intro({ onLeaving, onFinish }) {
  const [leaving, setLeaving] = useState(false)
  const [reduced] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const leftRef = useRef(false)
  const holdTimer = useRef(null)

  // 페이드아웃 시작 = 스크롤 잠금 해제 신호 (중복 호출 방지)
  const beginLeave = () => {
    if (leftRef.current) return
    leftRef.current = true
    setLeaving(true)
    onLeaving?.()
  }

  // 카운팅 완료 → 잠시 머문 뒤 본문 인계
  const handleCountDone = () => {
    clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(beginLeave, COUNT_HOLD)
  }

  useEffect(() => () => clearTimeout(holdTimer.current), [])

  const handleTransitionEnd = (e) => {
    // 자식 요소가 아니라 오버레이 자신의 페이드가 끝났을 때만 종료
    if (leaving && e.target === e.currentTarget && e.propertyName === 'opacity') {
      onFinish()
    }
  }

  return (
    <div
      className={`${styles.intro} ${leaving ? styles.leaving : ''}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    >
      {reduced ? (
        // 모션 최소화: 3D·카운팅 생략, 정적 표시 후 바로 본문으로
        <DomCounter animate={false} onCountDone={beginLeave} />
      ) : (
        <GLBoundary
          fallback={<DomCounter animate onCountDone={handleCountDone} />}
        >
          <div className={styles.canvasWrap}>
            <Canvas
              dpr={[1, 1.75]}
              camera={{ position: [0, 0, 6.3], fov: 50 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
              }}
            >
              <IntroScene onCountDone={handleCountDone} />
            </Canvas>
          </div>
        </GLBoundary>
      )}
    </div>
  )
}

export default Intro
