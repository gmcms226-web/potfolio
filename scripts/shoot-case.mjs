// 케이스스터디 페이지 확인용 — dev 서버(5173)의 /projects/<slug> 를 열어 갤러리 영역을 찍는다
// 사용: node scripts/shoot-case.mjs <slug> [스크롤px]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const slug = process.argv[2] || 'web'
const scrollY = Number(process.argv[3] || 900)

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--window-size=1280,900'],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
await page.goto(`http://localhost:5173/projects/${slug}`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))
await page.evaluate((y) => window.scrollTo(0, y), scrollY)
await new Promise((r) => setTimeout(r, 800))
await page.screenshot({ path: `${OUT}/case-${slug}-gallery.png` })
console.log(`saved: ${OUT}/case-${slug}-gallery.png`)
await browser.close()
