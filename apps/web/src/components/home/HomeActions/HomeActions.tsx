import mdiAlertCircle from '@iconify/icons-mdi/alert-circle'
import mdiGitHub from '@iconify/icons-mdi/github'
import mdiLoading from '@iconify/icons-mdi/loading'
import mdiWindows from '@iconify/icons-mdi/windows'
import type { IconifyIcon } from '@iconify/react'
import { Icon } from '@iconify/react'

import { FC, ReactNode, useMemo } from 'react'

import { Release, ReleaseAsset, useRelease } from '../../../hooks/use-release'
import { formatDate } from '../../../utils/format'
import { GlowButton } from '../../foundations/GlowButton/GlowButton'

interface PlatformPredicate {
  icon: IconifyIcon
  title: string
  assetMatcher: (release: Release) => ReleaseAsset | undefined
}

const predicates: PlatformPredicate[] = [
  {
    icon: mdiWindows,
    title: 'Windows',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MeoAssistantArknights_.*\.zip/.test(el.name),
      )
    },
  },
]

interface ResolvedPlatform {
  asset: ReleaseAsset
  platform: PlatformPredicate
}

export const DownloadButtons: FC<{ release: Release }> = ({ release }) => {
  const platforms = useMemo(() => {
    return predicates.reduce((acc, platform) => {
      const asset = platform.assetMatcher(release)
      if (asset)
        acc.push({
          asset,
          platform,
        })
      return acc
    }, [] as ResolvedPlatform[])
  }, [release])

  return (
    <>
      {platforms.map((platform) => (
        <GlowButton bordered href={platform.asset.browser_download_url}>
          <div className="flex flex-col items-start">
            <div className="flex items-center -ml-1">
              <Icon icon={platform.platform.icon} fontSize="28px" />
              <span className="ml-2">{platform.platform.title}</span>
            </div>
            <div className="flex mt-1 mb-0.5 ml-8">
              <span className="text-xs">
                {release.name} ({formatDate(release.created_at)})
              </span>
            </div>
          </div>
        </GlowButton>
      ))}
    </>
  )
}

export const StaleVersion: FC<{
  icon: IconifyIcon
  iconClassName?: string
  title: ReactNode
}> = ({ icon, iconClassName, title }) => {
  return (
    <div className="flex py-6 px-3 flex-col items-center justify-center text-white font-normal">
      <div className="flex items-center -ml-1">
        <Icon className={iconClassName} icon={icon} fontSize="28px" />
        <span className="ml-2">{title}</span>
      </div>
    </div>
  )
}

export const HomeActions: FC = () => {
  const { data, error } = useRelease()
  return (
    <div className="absolute bottom-0 left-0 right-0 mb-24 md:mb-[7vh] flex flex-col mx-8">
      <div className="flex-col items-center justify-center hidden gap-2 font-light md:flex md:flex-row md:gap-6">
        {error ? (
          <StaleVersion
            icon={mdiAlertCircle}
            title={
              <div className="flex flex-col ml-4">
                <span className="mb-2">载入版本信息失败。您可尝试</span>
                <GlowButton
                  translucent
                  bordered
                  href="https://github.com/MaaAssistantArknights/MaaAssistantArknights/releases"
                >
                  <span className="text-sm">前往 GitHub Releases 下载</span>
                </GlowButton>
              </div>
            }
          />
        ) : data ? (
          <DownloadButtons release={data} />
        ) : (
          <StaleVersion
            iconClassName="animate-spin"
            icon={mdiLoading}
            title="正在载入版本信息..."
          />
        )}
      </div>

      <div className="flex flex-row items-center justify-center md:hidden">
        <GlowButton>
          <div className="flex items-center -ml-1 text-sm">
            <Icon icon={mdiGitHub} fontSize="20px" />
            <span className="ml-2">GitHub</span>
          </div>
        </GlowButton>
      </div>

      <div className="mt-6 text-xs leading-5 text-center md:mt-8 text-white/70">
        MAA 以 AGPL-3.0 协议开源；使用即表示您同意并知悉「用户协议」的相关内容。
      </div>

      <div className="flex-row items-center justify-center hidden mt-4 md:flex">
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
