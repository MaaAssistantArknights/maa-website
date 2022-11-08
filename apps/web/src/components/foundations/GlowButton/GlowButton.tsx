import { FCC } from '@/types'

import clsx from 'clsx'
import { MouseEventHandler, memo } from 'react'

import styles from './GlowButton.module.css'

export const GlowButton: FCC<{
  translucent?: boolean
  bordered?: boolean
  href?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}> = memo(({ children, translucent, bordered, href, onClick }) => {
  const inner = (
    <button
      type="button"
      className={clsx(
        styles.root,
        !translucent && 'bg-zinc-900/80',
        translucent && 'bg-zinc-900/80 hover:bg-zinc-700/40',
        !bordered && 'border-none',
        'flex px-6 py-3 active:bg-zinc-800 rounded-lg hover:-translate-y-[1px] active:translate-y-[1px] text-2xl text-white/80',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={styles.link}
      >
        {inner}
      </a>
    )
  }
  return inner
})
