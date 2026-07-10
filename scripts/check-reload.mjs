// 재현 검증 — 끝까지 스크롤한 뒤 F5(reload) 했을 때 인트로 후 위치 확인
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  defaultViewport: { width: 1280, height: 800 },
})

const page = await browser.newPage()
page.on('pageerror', (err) => console.log('[pageerror]', err.message))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000)) // 인트로 종료 대기

// 끝 섹션까지 스크롤
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await new Promise((r) => setTimeout(r, 1200))
console.log('before reload scrollY:', await page.evaluate(() => window.scrollY))

// F5
await page.reload({ waitUntil: 'networkidle0' })

// 인트로 진행 중 + 종료 후 시점별 스크롤 위치 추적
for (const t of [1000, 2500, 4000, 6000]) {
  await new Promise((r) => setTimeout(r, t === 1000 ? 1000 : 1500))
  const y = await page.evaluate(() => window.scrollY)
  console.log(`t=${t}ms scrollY:`, y)
}

await page.screenshot({ path: `${OUT}/after-reload.png` })

// 리로드 후 순서 검증 — 스크롤을 내리며 섹션이 제 순서로 나오는지
const vh = 800
for (const s of [1.5, 8, 16]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(s * vh))
  await new Promise((r) => setTimeout(r, 1000))
  await page.screenshot({ path: `${OUT}/reload-${s}vh.png` })
}
console.log('final scrollY:', await page.evaluate(() => window.scrollY))

await browser.close()
