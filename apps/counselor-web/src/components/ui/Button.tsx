import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ children, className = '', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`button button--${variant} ${className}`.trim()} type={type} {...props}>{children}</button>
}
