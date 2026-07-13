import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CASE_STUDIES } from '../data/caseStudies'
import styles from './CaseStudy.module.css'

/* 카테고리 상세 페이지 — pin 연출 없는 밝은 톤의 읽는 페이지.
   메인(다크)과의 대비로 "페이지가 넘어갔다"는 감각을 준다 */

/* src/assets/case/ 폴더의 <slug>-N.* 이미지를 자동 연결 */
const imageModules = import.meta.glob('../assets/case/*', {
  eager: true,
  import: 'default',
})

/* 글쓰기 해부 캡처 — src/assets/write/write-<챕터>-<순서>.png 자동 연결.
   data.writing의 img 키("write-1-1")와 파일명으로 매칭한다 */
const writeModules = import.meta.glob('../assets/write/write-*', {
  eager: true,
  import: 'default',
})
const writeImageByKey = {}
for (const [path, url] of Object.entries(writeModules)) {
  const match = path.match(/(write-\d+-\d+)/i)
  if (match) writeImageByKey[match[1].toLowerCase()] = url
}

function CaseStudy() {
  const { slug } = useParams()
  const data = CASE_STUDIES[slug]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!data) return <Navigate to="/" replace />

  const images = Object.entries(imageModules)
    .filter(([path]) => path.includes(`/${slug}-`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url)

  const next = CASE_STUDIES[data.next]

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" state={{ returnTo: 'projects' }} className={styles.back}>
          ← 메인으로
        </Link>
        <span className={styles.brand}>추민석 — 반응을 읽는 마케터</span>
      </header>

      <main className={styles.inner} key={slug}>
        <p className={styles.num}>{data.num}</p>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.subtitle}>{data.subtitle}</p>

        <dl className={styles.meta}>
          {data.meta.map(([label, value]) => (
            <div key={label} className={styles.metaItem}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.intro}>{data.intro}</p>

        {!data.chapters && images.length > 0 && (
          <div className={styles.gallery}>
            {images.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" />
            ))}
          </div>
        )}

        {/* 챕터 구조 — 성격이 다른 프로젝트들이 각자 서사(문제→해결→갤러리→회고)를 가진다 */}
        {data.chapters?.map((chapter, i) => (
          <section key={chapter.title} className={styles.chapter}>
            <header className={styles.chapterHead}>
              <span className={styles.chapterNum}>
                CHAPTER {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{chapter.title}</h3>
              <span className={styles.chapterTone}>{chapter.tag}</span>
            </header>
            {chapter.links && (
              <div className={styles.links}>
                {chapter.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkChip}
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
            {chapter.sections.map((section) => (
              <div key={section.heading} className={styles.block}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            ))}
            <div className={styles.chapterGallery}>
              {images.slice(chapter.gallery.from - 1, chapter.gallery.to).map((src) => (
                <img key={src} src={src} alt={chapter.title} loading="lazy" />
              ))}
            </div>
            <div className={styles.retro}>
              <span className={styles.retroLabel}>회고</span>
              <p>{chapter.retro}</p>
            </div>
          </section>
        ))}

        {data.sections.map((section) => (
          <section key={section.heading} className={styles.block}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            {section.links && (
              <div className={styles.links}>
                {section.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkChip}
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}

        {data.writing && (
          <section className={styles.writing}>
            <h2 className={styles.writingHeading}>{data.writing.heading}</h2>
            <p className={styles.writingIntro}>{data.writing.intro}</p>
            {data.writing.chapters.map((chapter, i) => (
              <div key={chapter.title} className={styles.chapter}>
                <header className={styles.chapterHead}>
                  <span className={styles.chapterNum}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{chapter.title}</h3>
                  <span className={styles.chapterTone}>{chapter.tone}</span>
                </header>
                {chapter.desc && (
                  <p className={styles.chapterDesc}>{chapter.desc}</p>
                )}
                {chapter.items.map(
                  (item) =>
                    writeImageByKey[item.img] && (
                      <figure key={item.img} className={styles.writeRow}>
                        <figcaption>
                          <span className={styles.stage}>{item.stage}</span>
                          <p>{item.caption}</p>
                        </figcaption>
                        <img
                          src={writeImageByKey[item.img]}
                          alt={`${chapter.title} — ${item.stage}`}
                          loading="lazy"
                        />
                      </figure>
                    ),
                )}
              </div>
            ))}
          </section>
        )}

        {data.comingSoon && (
          <p className={styles.comingSoon}>
            상세 내용을 정리하고 있습니다. 곧 업데이트됩니다.
          </p>
        )}
      </main>

      <footer className={styles.footer}>
        <Link to={`/projects/${data.next}`} className={styles.next}>
          다음 프로젝트 — {next.title} →
        </Link>
      </footer>
    </div>
  )
}

export default CaseStudy
