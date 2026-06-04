import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const LABELS = {
  title: 'Notes',
  subtitle: 'Enter your email to receive a sign-in link.',
  emailPlaceholder: 'you@example.com',
  sendButton: 'Send magic link',
  sendingButton: 'Sending\u2026',
  checkEmailTitle: 'Check your email',
  checkEmailPrefix: 'We sent a magic link to ',
  checkEmailSuffix: '. Click it to sign in.',
}

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await signIn(email)
      if (signInError) {
        setError(signInError.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      console.error('Unexpected sign-in error:', err.message)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <h1>{LABELS.checkEmailTitle}</h1>
        <p>
          {LABELS.checkEmailPrefix}
          <strong>{email}</strong>
          {LABELS.checkEmailSuffix}
        </p>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h1>{LABELS.title}</h1>
      <p>{LABELS.subtitle}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={LABELS.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? LABELS.sendingButton : LABELS.sendButton}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
