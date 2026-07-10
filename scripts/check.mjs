// 콜드 로드 검증 — 헤드리스 Edge로 오프닝 시퀀스를 실제로 스크롤하며 스크린샷을 뜬다
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--window-size=1280,800'],
  defaultViewport: { width: 1280, height: 800 },
})

const page = await browser.newPage()
const logs = []
page.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type())) logs.push(`[${msg.type()}] ${msg.text()}`)
})
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })

// 인트로 카운팅(2.3s) + 페이드(0.8s)가 끝날 때까지 대기
await new Promise((r) => setTimeout(r, 4000))

const info = await page.evaluate(() => ({
  scrollY: window.scrollY,
  scrollHeight: document.documentElement.scrollHeight,
  overflow: document.documentElement.style.overflow,
  pinSpacers: document.querySelectorAll('.pin-spacer').length,
  sections: [...document.querySelectorAll('main > *')].map((el) => ({
    cls: el.className.slice(0, 40),
    top: Math.round(el.getBoundingClientRect().top),
    h: Math.round(el.getBoundingClientRect().height),
  })),
}))
console.log(JSON.stringify(info, null, 2))

await page.screenshot({ path: `${OUT}/0-after-intro.png` })

// 스크롤 깊이별 스크린샷 — Reaction 400% 구간을 훑는다
const vh = 800
const stops = [0.5, 1.2, 2.0, 2.8, 3.6, 4.4, 5.5, 6.5]
for (const s of stops) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(s * vh))
  await new Promise((r) => setTimeout(r, 900)) // scrub 안정화 대기
  await page.screenshot({ path: `${OUT}/${s}vh.png` })
}

console.log('CONSOLE LOGS:', logs.length ? logs : '(none)')
await browser.close()
