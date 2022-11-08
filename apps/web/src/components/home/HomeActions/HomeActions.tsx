import { GlowButton } from '@/components/foundations/GlowButton/GlowButton'
import {
  DownloadState,
  HomeActionsRelease,
  HomeActionsReleaseErrorBoundary,
} from '@/components/home/HomeActionsRelease/HomeActionsRelease'
import mdiDocument from '@iconify/icons-mdi/document'
import mdiGitHub from '@iconify/icons-mdi/github'
import mdiLoading from '@iconify/icons-mdi/loading'
import { Icon } from '@iconify/react'

import { FC, Suspense } from 'react'

export const HomeActions: FC = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-24 md:mb-[7vh] flex flex-col mx-8">
      <div className="flex-col items-center justify-center hidden gap-2 font-light md:flex md:flex-row md:gap-6">
        <HomeActionsReleaseErrorBoundary>
          <Suspense
            fallback={
              <DownloadState
                iconClassName="animate-spin"
                icon={mdiLoading}
                title="正在载入版本信息..."
              />
            }
          >
            <HomeActionsRelease />
          </Suspense>
        </HomeActionsReleaseErrorBoundary>

        <GlowButton bordered href="/docs">
          <div className="flex flex-col items-start">
            <div className="flex items-center -ml-1">
              <Icon icon={mdiDocument} fontSize="28px" />
              <span className="ml-2">文档与 FAQ</span>
            </div>
            <div className="flex mt-1 mb-0.5 ml-8">
              <span className="text-xs"></span>
            </div>
          </div>
        </GlowButton>
      </div>

      <div className="flex flex-row items-center justify-center md:hidden">
        <GlowButton bordered href="https://github.com/MaaAssistantArknights">
          <div className="flex items-center -ml-1 text-sm">
            <Icon icon={mdiGitHub} fontSize="20px" />
            <span className="ml-2">GitHub</span>
          </div>
        </GlowButton>
      </div>

      <div className="mt-6 text-xs leading-5 text-center md:mt-8 text-white/70">
        MAA 以 AGPL-3.0 协议开源；使用即表示您同意并知悉「用户协议」的相关内容。
      </div>

      <div className="flex-row gap-4 items-center justify-center hidden mt-4 md:flex">
        <GlowButton translucent href="https://github.com/MaaAssistantArknights">
          <div className="flex items-center -ml-1 text-sm">
            <Icon icon={mdiGitHub} fontSize="20px" />
            <span className="ml-2">GitHub</span>
          </div>
        </GlowButton>
      </div>
    </div>
  )
}
