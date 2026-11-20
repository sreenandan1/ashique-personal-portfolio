import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform, useMotionValue, useReducedMotion } from 'framer-motion'
import { book, phone, roles, statement, aboutText, aboutExtra, logos, ozfero, companies, products, moments, stats } from './data.js'

const ease = [0.22, 1, 0.36, 1]

function Reveal({ children, delay = 0, y = 36, className = '', as = 'div' }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M className={className} initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, delay, ease }}>
      {children}
    </M>
  )
}

function Progress() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  return <motion.div className="progress" style={{ scaleX: x }} />
}

function CursorGlow() {
  const x = useMotionValue(-600), y = useMotionValue(-600)
  const sx = useSpring(x, { stiffness: 110, damping: 20 }), sy = useSpring(y, { stiffness: 110, damping: 20 })
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const m = (e) => { x.set(e.clientX - 260); y.set(e.clientY - 260) }
    window.addEventListener('pointermove', m)
    return () => window.removeEventListener('pointermove', m)
  }, [x, y])
  return <motion.div className="glow" style={{ x: sx, y: sy }} aria-hidden="true" />
}

function ParticleField() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -999, y: -999 }
    let w = 0, h = 0, raf = 0, pts = []
    const init = () => {
      const r = c.parentElement.getBoundingClientRect()
      w = r.width; h = r.height
      c.width = w * dpr; c.height = h * dpr
      c.style.width = w + 'px'; c.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(110, Math.floor((w * h) / 14000))
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        if (!reduce) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) || 1
          if (d < 140) { p.x += (dx / d) * 1.4; p.y += (dy / d) * 1.4 }
        }
        ctx.fillStyle = 'rgba(0, 255, 135, 0.8)'
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill()
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 120) {
            ctx.strokeStyle = `rgba(5, 223, 114, ${(1 - d / 120) * 0.4})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke()
          }
        }
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y)
        if (md < 160) {
          ctx.strokeStyle = `rgba(0, 255, 135, ${(1 - md / 160) * 0.6})`
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    const move = (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
    const leave = () => { mouse.x = mouse.y = -999 }
    const onResize = () => { init(); if (reduce) draw() }
    init(); draw()
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', move)
    document.addEventListener('mouseleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', leave)
    }
  }, [])
  return <canvas ref={ref} className="field" aria-hidden="true" />
}

function Typing({ words }) {
  const [i, setI] = useState(0), [t, setT] = useState(''), [del, setDel] = useState(false)
  useEffect(() => {
    const w = words[i]
    let id
    if (!del && t === w) id = setTimeout(() => setDel(true), 1400)
    else if (del && t === '') { setDel(false); setI((i + 1) % words.length) }
    else id = setTimeout(() => setT(w.slice(0, t.length + (del ? -1 : 1))), del ? 40 : 80)
    return () => clearTimeout(id)
  }, [t, del, i, words])
  return <span className="typing" aria-label={words[i]}>{t}<i className="caret" /></span>
}

function Magnetic({ children, className, href, ...rest }) {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15 }), sy = useSpring(y, { stiffness: 220, damping: 15 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.3)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }
  return (
    <motion.a href={href} className={className} style={{ x: sx, y: sy }} onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0) }} {...rest}>{children}</motion.a>
  )
}

function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const rx = useMotionValue(0), ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 15 }), sry = useSpring(ry, { stiffness: 150, damping: 15 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 10); rx.set((0.5 - py) * 10)
    ref.current.style.setProperty('--mx', px * 100 + '%')
    ref.current.style.setProperty('--my', py * 100 + '%')
  }
  return (
    <motion.div ref={ref} className={'tilt ' + className} style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0) }}>{children}</motion.div>
  )
}

function Word({ w, i, n, p }) {
  const o = useTransform(p, [i / n, (i + 1) / n], [0.18, 1])
  return <motion.span style={{ opacity: o }}>{w} </motion.span>
}

function ScrollText({ text }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] })
  const ws = text.split(' ')
  return <p ref={ref} className="scrolltext">{ws.map((w, i) => <Word key={i} w={w} i={i} n={ws.length} p={scrollYProgress} />)}</p>
}

function ParallaxImg({ src, alt, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} className={'pimg ' + className}>
      <motion.img style={{ y, scale: 1.18 }} src={src} alt={alt} loading="lazy" />
    </div>
  )
}

/* Kinetic Animated Counter for Stats */
function Counter({ value }) {
  const [display, setDisplay] = useState(0)
  const isNumeric = /^\d+/.test(value)
  const num = isNumeric ? parseInt(value, 10) : null
  const suffix = isNumeric ? value.replace(/^\d+/, '') : ''

  useEffect(() => {
    if (!isNumeric) return
    let start = 0
    const duration = 1500
    const startTime = performance.now()

    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(easeProgress * num)
      setDisplay(current)
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplay(num)
      }
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [num, isNumeric])

  if (!isNumeric) {
    return <span className="counter-text">{value}</span>
  }

  return (
    <span className="counter-num">
      {display}{suffix}
    </span>
  )
}

/* Futuristic 3D Parallax & Laser Pulse Hero Visual */
function HeroVisual() {
  const mx = useMotionValue(0), my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 85, damping: 18 })
  const smy = useSpring(my, { stiffness: 85, damping: 18 })

  // 3D Parallax Layer Transformations
  const arcX = useTransform(smx, (v) => v * 0.35)
  const arcY = useTransform(smy, (v) => v * 0.35)
  const portraitX = useTransform(smx, (v) => v * 0.75)
  const portraitY = useTransform(smy, (v) => v * 0.75)
  const rotX = useTransform(smy, (v) => -v * 0.07)
  const rotY = useTransform(smx, (v) => v * 0.07)

  const badgeTopX = useTransform(smx, (v) => v * 1.35)
  const badgeTopY = useTransform(smy, (v) => v * 1.35)
  const badgeBotX = useTransform(smx, (v) => v * 1.6)
  const badgeBotY = useTransform(smy, (v) => v * 1.6)

  const onHeroMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    mx.set(x * 0.14)
    my.set(y * 0.14)
  }

  const onHeroLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="hero-visual-wrap" onMouseMove={onHeroMove} onMouseLeave={onHeroLeave}>
      {/* Neon Crescent Glow Arc with Animated Laser Pulses & Traveling Satellite */}
      <motion.div className="neon-arc-container" style={{ x: arcX, y: arcY }} aria-hidden="true">
        <svg viewBox="0 0 500 500" className="neon-arc-svg">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF87" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#05DF72" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#061A12" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF87" stopOpacity="1" />
              <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#05DF72" stopOpacity="0" />
            </linearGradient>
            <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="18" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="sparkGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Deep Ambient Neon Back-Glow */}
          <circle cx="270" cy="230" r="200" fill="none" stroke="url(#neonGradient)" strokeWidth="6" filter="url(#neonBlur)" />

          {/* Moving Laser Beam Ring */}
          <circle cx="270" cy="230" r="200" fill="none" stroke="url(#laserGrad)" strokeWidth="3" className="laser-beam-ring" />

          {/* Counter-Rotating Dashed Orbit Ring */}
          <circle cx="270" cy="230" r="224" fill="none" stroke="rgba(0,255,135,0.38)" strokeWidth="1.5" className="orbit-dashed-ring" />

          {/* Satellite Orbit with Glowing Particle */}
          <g className="satellite-orbit">
            <circle cx="270" cy="230" r="180" fill="none" stroke="rgba(5,223,114,0.18)" strokeWidth="1" />
            <circle cx="450" cy="230" r="4.5" fill="#00FF87" filter="url(#sparkGlow)" className="satellite-spark" />
          </g>
        </svg>
        <div className="neon-radial-ambient" />
      </motion.div>

      {/* Main High-Res Portrait Frame with 3D Parallax & Gentle Levitation */}
      <motion.div
        className="portrait-frame"
        style={{ x: portraitX, y: portraitY, rotateX: rotX, rotateY: rotY }}
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      >
        <div className="portrait-hologram-shimmer" />
        <img
          src="/assets/hero-new.jpg"
          alt="Ashique P K - Founder & Managing Director"
          className="portrait-photo"
        />
        <div className="portrait-fade-overlay" />
      </motion.div>

      {/* Dynamic Floating Badges with Multi-Layer Parallax & Levitation */}
      <motion.div
        className="float-badge top-badge"
        style={{ x: badgeTopX, y: badgeTopY }}
        animate={{ y: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        <div className="badge-pulse-dot" />
        <div>
          <strong>Founder &amp; MD</strong>
          <span>Ozfero Digital Solutions</span>
        </div>
      </motion.div>

      <motion.div
        className="float-badge bottom-badge"
        style={{ x: badgeBotX, y: badgeBotY }}
        animate={{ y: [6, -6, 6] }}
        transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut" }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        <span className="badge-icon-globe">🌐</span>
        <div>
          <strong>UAE Based</strong>
          <span>Building Global Impact</span>
        </div>
      </motion.div>
    </div>
  )
}

function Nav() {
  return (
    <header className="nav">
      <div className="wrap navrow">
        <a className="brand" href="#top">
          <span className="brand-dot">●</span> Ashique P K
        </a>
        <nav aria-label="Main">
          <a href="#about">About</a>
          <a href="#companies">Companies</a>
          <a href="#products">Products</a>
          <a href="#moments">Moments</a>
          <Magnetic className="btn primary small" href={book}>Book a Meeting</Magnetic>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="aurora" aria-hidden="true" />
      <ParticleField />
      <div className="wrap herogrid">
        <div>
          <div className="status-pill">
            <span className="pulse-dot" /> Entrepreneur • Founder • Full Stack Leader
          </div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
            Ashique P K
          </motion.h1>
          <motion.p className="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}>
            Founder &amp; Managing Director | Technology &amp; Digital Solutions
          </motion.p>
          <motion.p className="typeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            2K Global Entrepreneur: <Typing words={roles} />
          </motion.p>
          <motion.p className="statement" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease }}>
            {statement}
          </motion.p>
          <motion.div className="ctas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease }}>
            <Magnetic className="btn primary" href={book}>Book a Meeting</Magnetic>
            <Magnetic className="btn ghost" href="#contact">Contact Me</Magnetic>
          </motion.div>

          <div className="hero-stats">
            {stats.map((s) => (
              <div className="stat-item" key={s.label}>
                <strong><Counter value={s.value} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease }}>
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}

function Marquee() {
  const row = [...logos, ...logos, ...logos, ...logos]
  return (
    <div className="marquee" aria-label="Ventures">
      <div className="track">
        {row.map((l, i) => (
          <div className="mlogo" key={i}>
            <img src={l.src} alt={i < logos.length ? l.name : ''} />
          </div>
        ))}
      </div>
    </div>
  )
}

function About() {
  return (
    <section className="about" id="about">
      <div className="wrap aboutgrid">
        <Reveal><ParallaxImg src="/assets/about.jpg" alt="Ashique P K standing outdoors among tropical plants" className="tall" /></Reveal>
        <div>
          <Reveal as="h2">About</Reveal>
          <ScrollText text={aboutText} />
          <Reveal><p className="muted">{aboutExtra}</p></Reveal>
          <Reveal>
            <dl className="facts">
              <div><dt>Based in</dt><dd>Dubai, UAE</dd></div>
              <div><dt>Originally from</dt><dd>Kerala, India</dd></div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Services({ list }) {
  return <ul className="svc">{list.map((s) => <li key={s}>{s}</li>)}</ul>
}

function Companies() {
  return (
    <section id="companies">
      <div className="wrap">
        <Reveal as="h2">Companies &amp; Services</Reveal>
        <Reveal>
          <p className="muted lead">
            Primary technology company founded and led by Ashique P K, alongside strategic executive partnerships.
          </p>
        </Reveal>

        {/* 1. Primary Venture (Own Flagship Company) */}
        <div className="tier-container primary-tier">
          <div className="tier-header-bar">
            <span className="badge-tier own">★ Primary Venture • Own Company</span>
            <span className="tier-subtitle">Founder &amp; Managing Director</span>
          </div>

          <Reveal>
            <Tilt className="feature primary-feature">
              <div>
                <div className="logo feature-logo">
                  <img src={ozfero.logo} alt="Ozfero Digital Solutions logo" />
                </div>
                <div className="meta-badge-row">
                  <span className="badge-highlight">Flagship Tech Enterprise</span>
                  <p className="place">{ozfero.place}</p>
                </div>
                <h3>{ozfero.name}</h3>
                <p className="muted">{ozfero.text}</p>
              </div>
              <div>
                <h3>Services &amp; Capabilities</h3>
                <Services list={ozfero.services} />
                <div className="flag">
                  <strong>Flagship product:</strong> {ozfero.flagship}
                </div>
              </div>
            </Tilt>
          </Reveal>
        </div>

        {/* 2. Associated Ventures & Strategic Roles */}
        <div className="tier-container associated-tier">
          <div className="tier-header-alt">
            <Reveal as="h3">Associated Ventures &amp; Executive Leadership</Reveal>
            <Reveal>
              <p className="muted">
                Ventures and organisations where Ashique P K serves in an executive leadership, strategic advisory, or partnership capacity.
              </p>
            </Reveal>
          </div>

          <div className="cards">
            {companies.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.08}>
                <Tilt>
                  <div className="partner-header-tag">
                    <span className="partner-badge">{c.badge}</span>
                  </div>
                  <div className="logo small">
                    {c.logo ? <img src={c.logo} alt={c.name + ' logo'} /> : <span className="mono">India</span>}
                  </div>
                  <p className="place">{c.place}</p>
                  <h3>{c.name}</h3>
                  <p className="muted">{c.text}</p>
                  <Services list={c.services} />
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Products() {
  return (
    <section id="products">
      <div className="wrap">
        <Reveal as="h2">Products by Ozfero</Reveal>
        <Reveal><p className="muted lead">Two apps built by Ozfero Digital Solutions.</p></Reveal>
        {products.map((p) => (
          <div className="product" key={p.name}>
            <Reveal>
              <img className="ico" src={p.icon} alt={p.name + ' icon'} />
              <h3>{p.name}</h3>
              <p className="muted">{p.text}</p>
            </Reveal>
            <div className="shots" tabIndex={0} aria-label={p.name + ' screens'}>
              {p.shots.map(([src, alt], i) => <img key={src} src={src} alt={alt} loading="lazy" style={{ animationDelay: i * 0.7 + 's' }} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Moments() {
  return (
    <section id="moments">
      <div className="wrap">
        <Reveal as="h2">Moments</Reveal>
        <Reveal><p className="muted lead">In the studio and on the exhibition floor.</p></Reveal>
        <div className="momentgrid">{moments.map(([src, alt]) => <ParallaxImg key={src} src={src} alt={alt} />)}</div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact">
      <div className="wrap">
        <Reveal className="cta">
          <h2>Let’s build something together.</h2>
          <p>Partnerships, software projects, events or investment. Book a meeting and tell me what you have in mind.</p>
          <div className="ctas center">
            <Magnetic className="btn primary" href={book}>Book a Meeting</Magnetic>
            <Magnetic className="btn ghost" href={'tel:' + phone.replace(/\s/g, '')}>Contact Me: {phone}</Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Progress /><CursorGlow /><Nav />
      <main>
        <Hero />
        <div className="section-blur" aria-hidden="true" />
        <Marquee />
        <div className="section-blur" aria-hidden="true" />
        <About />
        <div className="section-blur" aria-hidden="true" />
        <Companies />
        <div className="section-blur" aria-hidden="true" />
        <Products />
        <div className="section-blur" aria-hidden="true" />
        <Moments />
        <div className="section-blur" aria-hidden="true" />
        <Contact />
      </main>
      <footer>© 2026 Ashique P K. Founder, Ozfero Digital Solutions, Dubai, UAE.</footer>
    </>
  )
}
