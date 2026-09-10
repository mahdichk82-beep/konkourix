import type { ReactNode } from 'react'

type ContentStateProps = {
  action?: ReactNode
  description: string
  kind: 'loading' | 'empty' | 'error'
  title: string
}

export function ContentState({ action, description, kind, title }: ContentStateProps) {
  return (
    <div className={`content-state content-state--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="content-state__icon" aria-hidden="true">
        {kind === 'loading' ? <span className="spinner" /> : kind === 'error' ? '!' : '·'}
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action && <div className="content-state__action">{action}</div>}
    </div>
  )
}
