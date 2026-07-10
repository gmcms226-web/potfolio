import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Projects.module.css'

gsap.registerPlugin(ScrollTrigger)

const photoModules = import.meta.glob('../../../assets/projects/*', {
  eager: true,
  import: 'default',
})

const photoByKey = {}
for (const [path, url] of Object.entries(photoModules)) {
  const match = path.match(/project-?(\d+)-(\d+)/i)
  if (match) photoByKey[`${match[1]}-${match[2]}`] = url
}

/* 세 카테고리 — 각각 /projects/<slug> 상세 페이지의 입구.
   상세 내용은 src/data/caseStudies.js 가 단일 출처다.

   폴딩 카드 4장은 "매거진 에디토리얼" 문법: 커버(1) → 화보 스프레드(2·3) → 백커버(4).
   화보 슬롯은 projects/project-N-M.* 이미지가 있으면 그걸 쓰고, 없으면 준비 중
   페이지로 렌더링된다. 커버·백커버도 같은 이름의 이미지를 넣으면 통째로 교체된다. */
const CARD_PROJECTS = [
  {
    num: '01',
    slug: 'marketing',
    title: '마케팅',
    meta: 'Viral · Content · 8 Years',
    desc: '8년간 블로그·카페 채널을 운영하며 검색 유입을 문의와 매출로 연결했습니다.',
    magazine: {
      vol: 'Vol.01',
      issue: 'ISSUE 01 — MARKETING',
      headline: ['검색을,', '문의로.'],
      sub: '블로그 · 카페 콘텐츠 8년의 기록',
      photos: [
        // pos: 캡처에서 보여줄 기준점(object-position) — 생략 시 top
        { page: 'P.01', caption: '검색 상위 노출 후기 콘텐츠', pos: 'left top' },
        { page: 'P.02', caption: '검색이 문의로 바뀐 기록' },
      ],
      back: {
        stat: '4개월, 문의 101건.',
        line: '읽는 사람의 언어로 쓰면, 반응은 따라옵니다.',
      },
    },
  },
  {
    num: '02',
    slug: 'web',
    title: '웹페이지 리뉴얼',
    meta: 'Web · 기획 – 디자인 – 개발',
    desc: '반응이 일어나는 공간을 직접 만듭니다. 정보 구조 분석부터 디자인, 개발, 배포까지 100% 수행한 웹 프로젝트입니다.',
    magazine: {
      vol: 'Vol.02',
      issue: 'ISSUE 02 — WEB',
      headline: ['반응이 일어나는', '공간을 직접.'],
      sub: '애견미용학원 리뉴얼 · 수목원 클론코딩',
      photos: [
        { page: 'P.01', caption: '답이 먼저 보이는 메인' },
        { page: 'P.02', caption: '지도 · 날씨 · 로그인, 직접 구현한 기능' },
      ],
      back: {
        stat: '기획–디자인–개발–배포, 100%.',
        line: '',
      },
    },
  },
  {
    num: '03',
    slug: 'automation',
    title: '블로그 자동화',
    meta: 'AI · Automation',
    desc: 'AI를 활용해 단순 업무를 효율성 있게 처리합니다.',
    magazine: {
      vol: 'Vol.03',
      issue: 'ISSUE 03 — AUTOMATION',
      headline: ['반복은 시스템에게,', '판단은 사람에게.'],
      sub: 'AI 콘텐츠 제작 파이프라인',
      photos: [
        { page: 'P.01', caption: '자동화 워크플로우' },
        { page: 'P.02', caption: '시스템이 만든 결과물' },
      ],
      back: {
        stat: 'NEXT ISSUE.',
        line: '자동화 편은 지금 기록을 정리하는 중입니다.',
      },
    },
  },
]

/* 개인 프로젝트 — 업무 밖에서 진행 중인 사이드 프로젝트 */
const PERSONAL_PROJECTS = [
  {
    title: '직장인멍생활',
    meta: 'Instagram Content Project',
    items: [
      '인스타 콘텐츠 기획',
      '4컷툰 시리즈 제작',
      '캐릭터 브랜딩',
      '릴스 콘텐츠 기획',
    ],
  },
  {
    title: 'AI Lyrics',
    meta: 'AI Music Project',
    items: [
      'AI를 활용한 음악 기획 및 아이디어 도출',
      '직접 작사 및 가사 구성',
      '음원 제작 프로젝트 진행',
      '아티스트 협업 진행 중',
    ],
  },
]

const INSIGHT_PROJECTS = [
  {
    category: 'SNS',
    title: 'SNS 콘텐츠 전략',
    description:
      '콘텐츠가 소비되는 맥락을 먼저 보고, 사용자의 관심 흐름과 검색 접점을 함께 설계합니다.',
    keywords: ['사용자 관점', '검색 최적화', '지역 타겟팅'],
  },
  {
    category: 'AI',
    title: 'AI 업무 워크플로우',
    description:
      '반복 작업을 줄이고 판단이 필요한 지점에 집중할 수 있도록 제작 흐름과 자동화 구조를 정리합니다.',
    keywords: ['Workflow', '생산성 향상', '자동화 설계'],
  },
  {
    category: 'Web',
    title: '웹 경험 설계',
    description:
      '정보 구조, 사용자 경험, 브랜드 메시지가 같은 방향으로 전달되도록 화면의 우선순위를 설계합니다.',
    keywords: ['사용자 경험', '정보 구조', '브랜드 전달'],
  },
]

function Projects() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const revealTargets = sectionRef.current?.querySelectorAll(`.${styles.reveal}`)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.28 },
    )

    revealTargets?.forEach((target) => observer.observe(target))

    if (reduced) {
      return () => observer.disconnect()
    }

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray(`.${styles.foldBlock}`)

      blocks.forEach((block) => {
        const text = block.querySelector(`.${styles.foldText}`)
        const cards = gsap.utils.toArray(block.querySelectorAll(`.${styles.foldCard}`))

        gsap.fromTo(
          text,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: block, start: 'top 65%' },
          },
        )

        gsap.set(cards, {
          xPercent: -50,
          yPercent: -50,
          transformOrigin: '50% 0%',
          transformPerspective: 1000,
        })

        cards.forEach((card, index) => {
          gsap.set(card, {
            x: index === 0 ? 0 : 34,
            y: index === 0 ? 0 : 140,
            rotation: index === 0 ? 0 : 3,
            rotationX: 0,
            scale: index === 0 ? 1 : 0.96,
            opacity: index === 0 ? 1 : 0,
            zIndex: cards.length - index,
          })
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top top',
            end: '+=3200',
            scrub: 1.15,
            pin: block,
            anticipatePin: 1,
          },
        })

        cards.forEach((card, index) => {
          if (index > 0) {
            tl.to(
              card,
              {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: 0.7,
                ease: 'power3.out',
              },
              `card-${index}`,
            )
          }

          tl.to({}, { duration: 0.35 })

          if (index < cards.length - 1) {
            tl.to(
              card,
              {
                y: -95,
                rotationX: -82,
                rotation: -1.5,
                scale: 0.94,
                opacity: 0.18,
                duration: 0.8,
                ease: 'power2.inOut',
              },
              `card-${index + 1}`,
            )
          }
        })
      })

      // 마지막 검은 섹션(POV) 퇴장 — 화면 바닥에 닿으면 그 자리에 고정된 채
      // 축소·페이드되고, Contact가 위를 덮으며 올라온다 (섹션 스택 전환).
      // 폴딩 카드 pin들과 스크롤 구간이 겹치지 않아 안전하다
      const insight = sectionRef.current?.querySelector(`.${styles.insightSection}`)
      if (insight) {
        // 섹션이 뷰포트보다 길 수 있으므로, 화면에 보이는 영역의 중심을 축소 원점으로 잡는다
        gsap.set(insight, {
          transformOrigin: () =>
            `50% ${Math.max(
              insight.offsetHeight - window.innerHeight / 2,
              insight.offsetHeight / 2,
            )}px`,
        })

        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: insight,
            start: 'bottom bottom',
            end: () => `+=${window.innerHeight * 1.5}`,
            pin: insight,
            pinSpacing: false,
            scrub: 1,
            anticipatePin: 1,
          },
        })

        exit
          .to(insight, { scale: 0.7, autoAlpha: 0.5, duration: 0.9, ease: 'none' })
          .to(insight, { autoAlpha: 0, duration: 0.1 })
      }
    }, sectionRef)

    return () => {
      observer.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.projects}>
      <div className={styles.foldHeader}>
        <p className={styles.eyebrow}>PROJECTS · SELECTED WORKS</p>
        <h2>대표 프로젝트</h2>
      </div>

      {CARD_PROJECTS.map((project, projectIndex) => (
        <FoldProject key={project.num} project={project} projectIndex={projectIndex} />
      ))}

      {/* 개인 프로젝트 — 일 밖에서도 반응을 만든다 */}
      <section className={styles.personalSection}>
        <div className={`${styles.personalHeader} ${styles.reveal}`}>
          <p className={styles.eyebrow}>PERSONAL PROJECTS</p>
          <h2>일 밖에서 만드는 반응</h2>
        </div>

        <div className={styles.personalGrid}>
          {PERSONAL_PROJECTS.map((project) => (
            <article
              key={project.title}
              className={`${styles.personalCard} ${styles.reveal}`}
            >
              <h3>{project.title}</h3>
              <p className={styles.personalMeta}>{project.meta}</p>
              <ul>
                {project.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.insightSection}>
        <div className={`${styles.insightHeader} ${styles.reveal}`}>
          <p className={styles.eyebrow}>PROJECT POINT OF VIEW</p>
          <h2>작업할 때 무엇을 보는가</h2>
        </div>

        <div className={styles.insightList}>
          {INSIGHT_PROJECTS.map((project) => (
            <InsightProject key={project.category} project={project} />
          ))}
        </div>
      </section>
    </section>
  )
}

function FoldProject({ project, projectIndex }) {
  const navigate = useNavigate()

  return (
    <div className={styles.foldBlock}>
      <div className={styles.foldInner}>
        <div className={styles.foldText}>
          <p className={styles.num}>
            {project.num} / {String(CARD_PROJECTS.length).padStart(2, '0')}
          </p>
          <p className={styles.meta}>{project.meta}</p>
          <h3>{project.title}</h3>
          <p className={styles.foldDesc}>{project.desc}</p>
          <Link to={`/projects/${project.slug}`} className={styles.detailLink}>
            자세히 보기 <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 카드 무대도 클릭하면 상세 페이지로 */}
        <div
          className={styles.foldStage}
          onClick={() => navigate(`/projects/${project.slug}`)}
        >
          {[1, 2, 3, 4].map((cardNum) => (
            <div key={cardNum} className={styles.foldCard}>
              <MagazineCard
                project={project}
                cardNum={cardNum}
                src={photoByKey[`${projectIndex + 1}-${cardNum}`]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* 매거진 에디토리얼 카드 — 카드 1=커버, 2·3=화보 스프레드, 4=백커버.
   이미지 파일(project-N-M.*)이 있으면: 화보 슬롯은 사진으로 채우고,
   커버·백커버 슬롯은 카드 전체를 이미지로 교체한다 */
function MagazineCard({ project, cardNum, src }) {
  const mag = project.magazine

  // 커버(1)·백커버(4)에 이미지가 있으면 통째로 교체
  if (src && (cardNum === 1 || cardNum === 4)) {
    return <img src={src} alt={`${project.title} 이미지 ${cardNum}`} loading="lazy" />
  }

  if (cardNum === 1) {
    return (
      <div className={styles.magCover}>
        <div className={styles.magMasthead}>
          <span className={styles.magBrand}>
            REACTION<em>.</em>
          </span>
          <span>{mag.vol}</span>
        </div>
        <h4 className={styles.magHeadline}>
          {mag.headline.map((line, i) => {
            const isLast = i === mag.headline.length - 1
            const hasPeriod = isLast && line.endsWith('.')
            return (
              <span key={line}>
                {hasPeriod ? line.slice(0, -1) : line}
                {hasPeriod && <em>.</em>}
              </span>
            )
          })}
        </h4>
        <div className={styles.magCoverFoot}>
          <span>{mag.issue}</span>
          <span className={styles.magCoverSub}>{mag.sub}</span>
        </div>
      </div>
    )
  }

  if (cardNum === 4) {
    return (
      <div className={styles.magBack}>
        <p className={styles.magBackStat}>
          {mag.back.stat.replace(/\.$/, '')}
          <em>.</em>
        </p>
        {mag.back.line && <p className={styles.magBackLine}>{mag.back.line}</p>}
        <div className={styles.magColophon}>
          <span>CHU MIN SEOK</span>
          <span>{mag.issue}</span>
        </div>
      </div>
    )
  }

  // 화보 스프레드 (2·3)
  const photo = mag.photos[cardNum - 2]

  return (
    <div className={styles.magSpread}>
      <div className={styles.magSpreadText}>
        <p className={styles.magPage}>{photo.page}</p>
        <div>
          <span className={styles.magRule} aria-hidden="true" />
          <p className={styles.magCaption}>{photo.caption}</p>
        </div>
        <p className={styles.magSpreadIssue}>{mag.vol}</p>
      </div>
      <div className={styles.magSpreadImg}>
        {src ? (
          <img
            src={src}
            alt={photo.caption}
            loading="lazy"
            style={photo.pos ? { objectPosition: photo.pos } : undefined}
          />
        ) : (
          <span className={styles.magPending}>화보 준비 중</span>
        )}
      </div>
    </div>
  )
}

function InsightProject({ project }) {
  return (
    <article className={`${styles.insightCard} ${styles.reveal}`}>
      <div className={styles.insightCopy}>
        <p className={styles.category}>{project.category}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>

      <div className={styles.keywordGraphic} aria-label={`${project.category} 핵심 키워드`}>
        {project.keywords.map((keyword, index) => (
          <div
            key={keyword}
            className={`${styles.circle} ${index === 1 ? styles.primaryCircle : ''}`}
          >
            <span>{keyword}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default Projects
