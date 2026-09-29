import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

type Props = {
  message: string
  onDone: () => void
  children?: ReactNode
  duration?: number
}

export function SuccessNotice({ message, onDone, children, duration = 4000 }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration)
    return () => window.clearTimeout(timer)
  }, [message, onDone, duration])

  return <p className="page-success"><FontAwesomeIcon icon={faCircleCheck} /> {children}{children ? ' ' : ''}{message}</p>
}
