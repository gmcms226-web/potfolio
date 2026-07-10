// 로컬 정적 사이트 스크린샷 → 폴딩 화보/갤러리 슬롯에 저장
// 사용: node scripts/shoot-static.mjs <사이트폴더> <페이지경로> <저장파일> [스크롤타겟 셀렉터]
// 예:  node scripts/shoot-static.mjs C:/Users/Administrator/Desktop/SEJONG /index.html src/assets/projects/project-2-3.png .info-section
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const [SITE, pagePath = '/index.html', outFile, focusSelector] = process.argv.slice(2)
if (!SITE || !outFile) {
  console.error('사용법: node scripts/shoot-static.mjs <사이트폴더> <페이지경로> <저장파일> [셀렉터]')
  process.exit(1)
}
const PORT = 8899

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
}

const server = http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url.split('?')[0])
    const file = join(SITE, url === '/' ? '/index.html' : url)
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
})

await new Promise((r) => server.listen(PORT, r))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: 'new',
  args: ['--window-size=1200,900'],
  defaultViewport: { width: 1200, height: 900 },
})

const page = await browser.newPage()
const logs = []
page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`))

await page.goto(`http://localhost:${PORT}${pagePath}`, { waitUntil: 'networkidle2', timeout: 30000 })

// 날씨 API처럼 비동기로 채워지는 위젯 대기 — 로딩 문구가 사라질 때까지 (최대 10초, 실패해도 진행)
try {
  await page.waitForFunction(
    () => {
      const t = document.querySelector('#weatherTemp')
      return !t || !t.textContent.includes('--')
    },
    { timeout: 10000 },
  )
} catch {
  console.log('경고: 날씨 위젯이 값으로 채워지지 않은 채 캡처됩니다')
}
await new Promise((r) => setTimeout(r, 2000))

if (focusSelector) {
  await page.evaluate((sel) => {
    // 플로팅 UI(챗봇 버튼 등)가 콘텐츠를 가리지 않게 숨긴다
    document.querySelectorAll('.chatbot-btn').forEach((el) => (el.style.display = 'none'))
    document.querySelector(sel)?.scrollIntoView({ block: 'center' })
  }, focusSelector)
  await new Promise((r) => setTimeout(r, 1200))
}

await page.screenshot({ path: outFile })
console.log('saved:', outFile)
if (logs.length) console.log('PAGE ERRORS:', logs)
await browser.close()
server.close()
