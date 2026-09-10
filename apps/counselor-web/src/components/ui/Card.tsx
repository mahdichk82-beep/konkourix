import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & { children: ReactNode; title?: string }

export function Card({ children, className = '', title, ...props }: CardProps) {
  return <section className={`card ${className}`.trim()} {...props}>{title && <h2 className="card__title">{title}</h2>}{children}</section>
}
