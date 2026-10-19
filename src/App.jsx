import { useEffect, useState } from 'react'
import RlEnvironments from './RlEnvironments.jsx'

const SPV = 'https://spvventures.co'
const LINKEDIN = 'https://linkedin.com/in/sprokofyev'
// TODO: replace with a Longrun address once one exists.
const EMAIL = 'prokofiev.sv@gmail.com'

function Arrow() {
  return (
    <svg className="arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 8L8 2M3.5 2H8V6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function Brand() {
  return (
    <a className="brand" href="/" aria-label="Longrun home">
      Longrun
    </a>
  )
}

function TopBar() {
  return (
    <div className="hero-top">
      <Brand />
      <a className="hero-link" href="#contact">
        Contact
      </a>
    </div>
  )
}

// White bar that floats in once the page header has scrolled away.
function FloatingBar() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 240)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`float-bar${shown ? ' is-shown' : ''}`} aria-hidden={!shown} inert={!shown}>
      <div className="float-bar-inner">
        <Brand />
        <a className="hero-link" href="#contact">
          Contact
        </a>
      </div>
    </div>
  )
}

function ContactForm() {
  const [sent, setSent] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    const { name, email, company, message } = Object.fromEntries(new FormData(e.currentTarget))
    const subject = `Sample dataset request: ${company}`
    const body = `${message}\n\nFrom: ${name} <${email}>, ${company}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label className="field">
        <span>
          Full name <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="text" name="name" required autoComplete="name" maxLength="120" placeholder="First and last name" />
      </label>
      <label className="field">
        <span>
          Email <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="email" name="email" required autoComplete="email" placeholder="name@company.com" />
      </label>
      <label className="field">
        <span>
          Company <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="text" name="company" required autoComplete="organization" maxLength="160" placeholder="Company name" />
      </label>
      <label className="field">
        <span>What your agents need to do</span>
        <textarea
          name="message"
          rows="4"
          maxLength="2000"
          placeholder={'The agents you’re training, the work they need to do, and what you’d like in a sample.'}
        />
      </label>
      <div className="contact-actions">
        <button type="submit" className="button">
          Send <Arrow />
        </button>
        {sent && (
          <p className="contact-error" role="status">
            Your email app should open with the request. If it didn&rsquo;t, write to{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
        )}
      </div>
    </form>
  )
}

function Footer() {
  return (
    <footer id="contact" className="band dark">
      <div className="container footer">
        <div className="footer-cta">
          <div className="footer-intro">
            <h2 className="footer-title">Request a sample dataset.</h2>
            <p className="footer-sub">Tell us about your agents and the work they need to do. We&rsquo;ll reply personally.</p>
          </div>
          <ContactForm />
        </div>
        <div className="footer-bottom">
          <span className="footer-brand">© {new Date().getFullYear()} Longrun</span>
          <span className="footer-links">
            <a href={SPV}>SPV Ventures</a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <FloatingBar />
      <RlEnvironments topBar={<TopBar />} />
      <Footer />
    </>
  )
}
