import chevronRight from '@iconify/icons-mdi/chevron-right'
import { Icon } from '@iconify/react'

import clsx from 'clsx'
import { FC, ReactNode, forwardRef } from 'react'

import linksIconArkNights from '../../../assets/links/ark-nights.com.png?url'
import linksIconPenguinStats from '../../../assets/links/penguin-stats.png?url'

import styles from './HomeLinks.module.css'

const HomeLink: FC<{
  href: string
  title: ReactNode
  icon?: ReactNode
}> = ({ href, title, icon }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-white/80 hover:text-black/100 bg-black hover:bg-white active:bg-white/60 p-2 rounded-md"
    >
      <div className="text-2xl h-8 w-8 rounded-sm overflow-hidden">{icon}</div>
      <span className="text-xl">{title}</span>
      <div className="flex-1" />
      <Icon icon={chevronRight} className="text-2xl" />
    </a>
  )
}

const LINKS = [
  <HomeLink
    href="https://penguin-stats.io"
    title="企鹅物流数据统计"
    icon={<img src={linksIconPenguinStats} alt="企鹅物流数据统计" />}
  />,
  <HomeLink
    href="https://ark-nights.com"
    title="Arknights | Planner"
    icon={<img src={linksIconArkNights} alt="Arknights | Planner" />}
  />,
]

export const HomeLinks = forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    className={clsx(
      'fixed right-[5vw] top-[20vh] hidden md:flex flex-col p-8 h-[60vh] w-[20vw] min-w-[20rem] text-[#eee] bg-black/80 rounded-xl opacity-0',
      styles.root,
    )}
  >
    <div className="text-md font-bold mb-1 opacity-80 tracking-wider">
      LINKS
    </div>
    <h1 className="text-4xl font-bold mb-4">友情链接</h1>
    <div className="flex-1 overflow-y-auto flex flex-col gap-2">{LINKS}</div>
  </div>
))
