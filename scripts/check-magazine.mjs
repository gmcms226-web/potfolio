// 매거진 폴딩 카드 검증 — Projects 폴딩 블록 3개를 스크롤하며 카드 4장을 각각 찍는다
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
await new Promise((r) => setTimeout(r, 4000))

// 폴딩 블록 pin-spacer들의 문서 기준 top을 찾는다 (Projects 영역 = 뒤쪽 3개)
const spacerTops = await page.evaluate(() =>
  [...document.querySelectorAll('.pin-spacer')].map((el) =>
    Math.round(el.getBoundingClientRect().top + window.scrollY),
  ),
)
console.log('pin-spacer tops:', spacerTops)

// Projects 폴딩 pin은 각 +=3200px — 블록 시작 이후 0/1100/2100/3100px 지점이 카드 1~4
// pin-spacer 순서: Reaction, About, Hero, 폴딩×3, POV 퇴장 → 폴딩은 4~6번째
const foldTops = spacerTops.slice(3, 6)
const offsets = [50, 1150, 2150, 3150]

for (const [b, top] of foldTops.entries()) {
  for (const [c, off] of offsets.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), top + off)
    await new Promise((r) => setTimeout(r, 1200))
    await page.screenshot({ path: `${OUT}/mag-${b + 1}-card${c + 1}.png` })
  }
}

console.log('CONSOLE LOGS:', logs.length ? logs : '(none)')
await browser.close()
