import { GlowButton } from '@/components/foundations/GlowButton/GlowButton'
import { Release, ReleaseAsset, useRelease } from '@/hooks/use-release'
import mdiAlertCircle from '@iconify/icons-mdi/alert-circle'
import mdiWindows from '@iconify/icons-mdi/windows'
import type { IconifyIcon } from '@iconify/react'
import { Icon } from '@iconify/react'

import moment from 'moment'
import { Component, FC, ReactNode, useMemo } from 'react'

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
      return release.assets.find((el) => /^MAA-v.*\.zip/.test(el.name))
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
      {platforms.length ? (
        platforms.map((platform) => (
          <GlowButton
            key={platform.platform.title}
            bordered
            href={platform.asset.browser_download_url}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center -ml-1">
                <Icon icon={platform.platform.icon} fontSize="28px" />
                <span className="ml-2">{platform.platform.title} 下载</span>
              </div>
              <div className="flex mt-1 mb-0.5 ml-8">
                <span className="text-xs">
                  {release.name} (
                  {moment(release.created_at).format('[build] YYYYMMDD')})
                </span>
              </div>
            </div>
          </GlowButton>
        ))
      ) : (
        <UndesiredReleaseState
          icon={mdiAlertCircle}
          title="未找到可用的下载链接"
        />
      )}
    </>
  )
}

export const UndesiredReleaseState: FC<{
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

export class HomeActionsReleaseErrorBoundary extends Component<{
  children?: React.ReactNode
}> {
  state = {
    error: null as Error | null,
  }

  componentDidCatch(error: Error) {
    this.setState({ error })
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <UndesiredReleaseState
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
      )
    }

    return this.props.children
  }
}

export const HomeActionsRelease: FC = () => {
  const { data } = useRelease()
  return <>{data && <DownloadButtons release={data} />}</>
}
