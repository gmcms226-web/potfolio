// 검색 장면 녹화 v2 — 커서(사람) 연출 + 흰 전환 구간 제거(2클립 병합)
// 사용법: node scripts/record-search.mjs  →  src/assets/reaction/search-demo.webm 교체
import { execFileSync } from 'node:child_process'
import puppeteer from 'puppeteer-core'
import ffmpeg from '@ffmpeg-installer/ffmpeg'

const OUT = 'src/assets/reaction/search-demo.webm'
const QUERY = '아이몽펫'
const BLOG_URL = 'https://blog.naver.com/choo4678/224200313811'
const W = 1024
const H = 640

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* 화면 안에 가짜 커서(부드러운 원)를 주입 — 사람이 조작하는 느낌의 핵심 */
async function injectCursor(ctx) {
  await ctx.evaluate(() => {
    const cursor = document.createElement('div')
    cursor.id = '__cursor'
    Object.assign(cursor.style, {
      position: 'fixed',
      left: '50%',
      top: '40%',
      width: '22px',
      height: '22px',
      marginLeft: '-11px',
      marginTop: '-11px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.85)',
      border: '2px solid rgba(20,20,20,0.75)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
      zIndex: '2147483647',
      pointerEvents: 'none',
      transition: 'left 0.9s cubic-bezier(0.25, 0.8, 0.3, 1), top 0.9s cubic-bezier(0.25, 0.8, 0.3, 1), transform 0.15s ease',
    })
    document.body.appendChild(cursor)
  })
}

async function moveCursor(ctx, x, y) {
  await ctx.evaluate(
    ([x, y]) => {
      const c = document.getElementById('__cursor')
      if (c) {
        c.style.left = `${x}px`
        c.style.top = `${y}px`
      }
    },
    [x, y],
  )
  await sleep(1000)
}

async function clickPulse(ctx) {
  await ctx.evaluate(() => {
    const c = document.getElementById('__cursor')
    if (!c) return
    c.style.transform = 'scale(0.7)'
    setTimeout(() => (c.style.transform = 'scale(1)'), 150)
    const ring = document.createElement('div')
    Object.assign(ring.style, {
      position: 'fixed',
      left: c.style.left,
      top: c.style.top,
      width: '22px',
      height: '22px',
      marginLeft: '-11px',
      marginTop: '-11px',
      borderRadius: '50%',
      border: '2px solid rgba(20,20,20,0.6)',
      zIndex: '2147483646',
      pointerEvents: 'none',
      transition: 'transform 0.45s ease-out, opacity 0.45s ease-out',
    })
    document.body.appendChild(ring)
    requestAnimationFrame(() => {
      ring.style.transform = 'scale(2.6)'
      ring.style.opacity = '0'
    })
    setTimeout(() => ring.remove(), 500)
  })
  await sleep(600)
}

async function smoothScroll(evaluate, distance, steps = 40, interval = 60) {
  const step = Math.round(distance / steps)
  for (let i = 0; i < steps; i++) {
    await evaluate((d) => window.scrollBy(0, d), step)
    await sleep(interval)
  }
}

async function record(name, fn) {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: 'new',
    defaultViewport: { width: W, height: H },
  })
  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  )
  let recorder
  try {
    // 페이지가 완전히 뜬 다음에만 녹화 시작 — 흰 로딩 화면이 찍히지 않게
    await fn.load(page)
    recorder = await page.screencast({ path: name, ffmpegPath: ffmpeg.path })
    await fn.action(page)
  } finally {
    await recorder?.stop()
    await browser.close()
  }
}

/* 클립 A: 검색 결과 — 커서가 내려와 후기 글을 클릭한다 */
await record('scripts/shots/clip-a.webm', {
  load: async (page) => {
    await page.goto(
      `https://search.naver.com/search.naver?query=${encodeURIComponent(QUERY)}`,
      { waitUntil: 'networkidle2', timeout: 30000 },
    )
    await sleep(800)
  },
  action: async (page) => {
    await injectCursor(page)
    await sleep(900)
    await smoothScroll((fn, arg) => page.evaluate(fn, arg), 760, 26, 65)
    await sleep(400)
    // 검색 결과에서 해당 블로그 글 링크의 위치를 찾아 커서를 보낸다
    const target = await page.evaluate(() => {
      const link = [...document.querySelectorAll('a')].find(
        (a) => a.href.includes('choo4678') || a.textContent.includes('아이몽펫'),
      )
      if (!link) return { x: 400, y: 300 }
      const rect = link.getBoundingClientRect()
      return { x: rect.left + Math.min(rect.width / 2, 200), y: rect.top + rect.height / 2 }
    })
    await moveCursor(page, target.x, target.y)
    await sleep(300)
    await clickPulse(page)
    await sleep(500)
  },
})

/* 클립 B: 블로그 글 — 읽듯이 스크롤 (본문은 iframe 안) */
await record('scripts/shots/clip-b.webm', {
  load: async (page) => {
    await page.goto(BLOG_URL, { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(1500)
  },
  action: async (page) => {
    const frame =
      page.frames().find((f) => f.name() === 'mainFrame') ?? page.mainFrame()
    await sleep(700)
    await smoothScroll((fn, arg) => frame.evaluate(fn, arg), 1500, 45, 70)
    await sleep(500)
    await smoothScroll((fn, arg) => frame.evaluate(fn, arg), 1300, 40, 70)
    await sleep(700)
  },
})

/* 병합 + 압축 — 하드컷(클릭 → 페이지 도착)이라 흰 화면 없이 자연스럽다 */
execFileSync(ffmpeg.path, [
  '-y',
  '-i', 'scripts/shots/clip-a.webm',
  '-i', 'scripts/shots/clip-b.webm',
  '-filter_complex',
  `[0:v]fps=30,scale=${W}:${H}[v0];[1:v]fps=30,scale=${W}:${H}[v1];[v0][v1]concat=n=2:v=1:a=0[v]`,
  '-map', '[v]',
  '-c:v', 'libvpx-vp9',
  '-b:v', '0',
  '-crf', '42',
  '-an',
  OUT,
])

console.log('saved:', OUT)
