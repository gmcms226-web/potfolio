// 케이스스터디 페이지 확인용 — dev 서버(5173)의 /projects/<slug> 를 열어 갤러리 영역을 찍는다
// 사용: node scripts/shoot-case.mjs <slug> [스크롤px]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

// slug가 '/'로 시작하면 절대 경로로 취급 (예: "/" = 홈)
const slug = process.argv[2] || 'web'
const scrollY = Number(process.argv[3] || 900)
const path = slug.startsWith('/') ? slug : `/projects/${slug}`

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--window-size=1280,900'],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000)) // 홈은 인트로(2.3s+페이드)까지 대기
await page.evaluate((y) => window.scrollTo(0, y), scrollY)
await new Promise((r) => setTimeout(r, 1600)) // IO 등장 트랜지션(스태거 포함) 완료 대기
const name = slug.startsWith('/') ? 'home' : slug
await page.screenshot({ path: `${OUT}/case-${name}-${scrollY}.png` })
console.log(`saved: ${OUT}/case-${name}-${scrollY}.png`)
await browser.close()
