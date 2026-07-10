// 이정민 애견미용학원 리뉴얼 사이트(Desktop/ljm) 스크린샷 → 폴딩 화보 슬롯에 저장
// 사용: node scripts/shoot-ljm.mjs [페이지경로] [저장파일명]
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const SITE = 'C:/Users/Administrator/Desktop/ljm'
const PORT = 8899
const pagePath = process.argv[2] || '/index.html'
const outFile = process.argv[3] || 'src/assets/projects/project-2-2.png'

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
// 등장 애니메이션·이미지 로딩 안정화 대기
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: outFile })

console.log('saved:', outFile)
if (logs.length) console.log('PAGE ERRORS:', logs)
await browser.close()
server.close()
