import clsx from 'clsx'
import { memo } from 'react'

import { FCC } from '../../../types'

import styles from './GlowButton.module.css'

export const GlowButton: FCC<{ translucent?: boolean; href?: string }> = memo(
  ({ children, translucent, href }) => {
    const inner = (
      <button
        type="button"
        className={clsx(
          styles.root,
          !translucent && 'bg-zinc-900/40',
          translucent && 'bg-transparent border-none hover:bg-zinc-700/40',
          'flex px-6 py-3 active:bg-zinc-800 rounded-lg hover:-translate-y-[1px] active:translate-y-[1px] text-2xl text-white/80',
        )}
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
  },
)
