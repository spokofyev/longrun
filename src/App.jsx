import { useEffect, useState } from 'react'
import RlEnvironments from './RlEnvironments.jsx'

// Links come from the CMS; only allow web, mail and in-page targets.
const safeHref = (h = '') => (/^(https?:|mailto:|#|\/)/i.test(h.trim()) ? h.trim() : '#')

function Arrow() {
  return (
    <svg className="arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 8L8 2M3.5 2H8V6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function Brand({ site }) {
  return (
    <a className="brand" href="/" aria-label={`${site.brand} home`}>
      {site.brand}
    </a>
  )
}

function TopBar({ site }) {
  return (
    <div className="hero-top">
      <Brand site={site} />
      <a className="hero-link" href="#contact">
        {site.navLink}
      </a>
    </div>
  )
}

// White bar that floats in once the page header has scrolled away.
function FloatingBar({ site }) {
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
        <Brand site={site} />
        <a className="hero-link" href="#contact">
          {site.navLink}
        </a>
      </div>
    </div>
  )
}

function ContactForm({ contact }) {
  const [sent, setSent] = useState(false)
  const email = contact.email

  function onSubmit(e) {
    e.preventDefault()
    const { name, email: from, company, message } = Object.fromEntries(new FormData(e.currentTarget))
    const subject = `Sample dataset request: ${company}`
    const body = `${message}\n\nFrom: ${name} <${from}>, ${company}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label className="field">
        <span>
          {contact.nameLabel} <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="text" name="name" required autoComplete="name" maxLength="120" placeholder="First and last name" />
      </label>
      <label className="field">
        <span>
          {contact.emailLabel} <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="email" name="email" required autoComplete="email" placeholder="name@company.com" />
      </label>
      <label className="field">
        <span>
          {contact.companyLabel} <span className="req" aria-hidden="true">*</span>
        </span>
        <input type="text" name="company" required autoComplete="organization" maxLength="160" placeholder="Company name" />
      </label>
      <label className="field">
        <span>{contact.messageLabel}</span>
        <textarea name="message" rows="4" maxLength="2000" placeholder={contact.messagePlaceholder} />
      </label>
      <div className="contact-actions">
        <button type="submit" className="button">
          {contact.button} <Arrow />
        </button>
        {sent && (
          <p className="contact-error" role="status">
            Your email app should open with the request. If it didn&rsquo;t, write to{' '}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        )}
      </div>
    </form>
  )
}

function Footer({ contact, footer }) {
  return (
    <footer id="contact" className="band dark">
      <div className="container footer">
        <div className="footer-cta">
          <div className="footer-intro">
            <h2 className="footer-title">{contact.title}</h2>
            {contact.subtitle && <p className="footer-sub">{contact.subtitle}</p>}
          </div>
          <ContactForm contact={contact} />
        </div>
        <div className="footer-bottom">
          <span className="footer-brand">
            © {new Date().getFullYear()} {footer.copyright}
          </span>
          <span className="footer-links">
            {footer.links.map((l, i) => (
              <a key={i} href={safeHref(l.body)} {...(/^https?:/i.test(l.body) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {l.title}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function App({ content }) {
  return (
    <>
      <FloatingBar site={content.site} />
      <RlEnvironments content={content} topBar={<TopBar site={content.site} />} />
      <Footer contact={content.contact} footer={content.footer} />
    </>
  )
}
