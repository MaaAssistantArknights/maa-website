import { GlowButton } from '@/components/foundations/GlowButton/GlowButton'
import { useLayoutState } from '@/contexts/LayoutStateContext'
import { Release, useRelease } from '@/hooks/use-release'
import i18n, { getLanguageOption } from '@/i18n'
import {
  DetectionFailedSymbol,
  PLATFORMS,
  ResolvedPlatform,
  detectPlatform,
} from '@/utils/detect'
import { formatBytes } from '@/utils/format'
import mdiAlertCircle from '@iconify/icons-mdi/alert-circle'
import mdiDownload from '@iconify/icons-mdi/download'
import mdiLoading from '@iconify/icons-mdi/loading'
import type { IconifyIcon } from '@iconify/react'
import { Icon } from '@iconify/react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Component,
  type ComponentType,
  FC,
  ReactNode,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Trans,
  WithTranslation,
  useTranslation,
  withTranslation,
} from 'react-i18next'
import { useMount } from 'react-use'

type GITHUB_MIRROR_TYPE = {
  name: string
  transform: (original: URL) => string
}

const GITHUB_MIRRORS: GITHUB_MIRROR_TYPE[] = [
  {
    name: 'origin',
    transform: (original: URL) => original.toString(),
  },
]

// 下载区各按钮统一的最小高度类，保证一排按钮高度一致
const downloadButtonClassName = 'min-h-[4.75rem] items-center'

// 下载区按钮的列容器：按钮 + 底部等高文字槽位（架构提示或占位），
// 保证各列高度、对齐一致
const DownloadButtonColumn: FC<{
  footer?: ReactNode
  children: ReactNode
}> = ({ footer, children }) => (
  <div className="flex flex-col items-center gap-1">
    {children}
    <div className="min-h-5 mt-1 text-xs">{footer}</div>
  </div>
)

const DataLoadRate: FC<{ loaded: number; total: number }> = ({
  loaded,
  total,
}) => {
  const percentage = useMemo(() => {
    const percentage = (loaded / total) * 100
    return percentage > 100 ? 100 : percentage
  }, [loaded, total])

  return (
    <div className="flex flex-row items-center justify-center gap-2 font-mono">
      <div className="flex flex-col items-start justify-center gap-1">
        <div className="text-sm transition-colors duration-300">
          {percentage.toFixed(0)}%
        </div>
        <div
          className={clsx(
            'w-12 h-1 rounded-full',
            'dark:bg-white/10',
            'bg-stone-800/10',
          )}
        >
          <div
            className={clsx(
              'h-full rounded-full',
              'dark:bg-white',
              'bg-stone-800',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="text-sm transition-colors duration-300">
          {formatBytes(loaded, 1)}
        </div>
        <div className="text-sm transition-colors duration-300">
          {formatBytes(total, 1)}
        </div>
      </div>
    </div>
  )
}

interface DownloadStateProps {
  icon: IconifyIcon
  iconClassName?: string
  title: ReactNode
  className?: string
  isCurrentPlatform?: boolean
}

export const DownloadState: FC<DownloadStateProps> = forwardRef<
  HTMLDivElement,
  DownloadStateProps
>(
  (
    { icon, iconClassName, title, className, isCurrentPlatform = false },
    ref,
  ) => {
    return (
      <motion.div
        className={clsx(
          'flex py-6 px-5 flex-col items-center justify-center font-normal transition-colors duration-300',
          'dark:text-white',
          'text-stone-800',
          className,
          isCurrentPlatform &&
            'allin-download-button rounded-lg relative isolate overflow-hidden *:relative *:z-10 dark:text-white text-stone-800',
        )}
        {...{
          exit: {
            scale: 0.9,
            opacity: 0,
          },
          initial: {
            scale: 0,
            opacity: 0,
          },
          animate: {
            scale: 1,
            opacity: 1,
          },
          transition: {
            type: 'spring',
            stiffness: 500,
            damping: 30,
          },
        }}
        ref={ref}
      >
        <div className="flex items-center -ml-1">
          <Icon
            className={clsx(iconClassName, 'transition-colors duration-300')}
            icon={icon}
            fontSize="28px"
          />
          <span className="ml-2 transition-colors duration-300">{title}</span>
        </div>
      </motion.div>
    )
  },
)
DownloadState.displayName = 'DownloadState'

type DownloadDetectionStates =
  | {
      state: 'idle'
    }
  | {
      state: 'downloading'
    }

type CompatibilityConfirmReason = 'detectWrong' | 'otherDevice'

const CompatibilityConfirmModal: FC<{
  open: boolean
  title: string
  warning: string
  detectWrongActionText: string
  detectWrongDescription: ReactNode
  otherDeviceActionText: string
  otherDeviceDescription: ReactNode
  cancelText: string
  onClose: () => void
  onSelectReason: (reason: CompatibilityConfirmReason) => void
}> = ({
  open,
  title,
  warning,
  detectWrongActionText,
  detectWrongDescription,
  otherDeviceActionText,
  otherDeviceDescription,
  cancelText,
  onClose,
  onSelectReason,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label={cancelText}
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'relative w-full max-w-xl rounded-2xl border p-5 shadow-2xl',
              'dark:bg-zinc-900/95 dark:border-zinc-700 dark:text-zinc-100',
              'bg-white/95 border-stone-200 text-stone-900',
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                icon={mdiAlertCircle}
                className="mt-0.5 shrink-0 text-orange-500"
                width="22"
                height="22"
              />
              <div className="space-y-3">
                <h3 className="text-base font-semibold dark:text-zinc-50 text-stone-900">
                  {title}
                </h3>
                <p className="text-sm leading-6 dark:text-zinc-200 text-stone-700">
                  {warning}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                className={clsx(
                  'w-full text-left rounded-xl border p-3 transition-colors',
                  'dark:border-zinc-700 dark:hover:bg-zinc-800/70',
                  'border-stone-200 hover:bg-stone-100/80',
                )}
                onClick={() => onSelectReason('detectWrong')}
              >
                <div className="text-sm font-medium">
                  {detectWrongActionText}
                </div>
                <div className="mt-1 text-xs dark:text-zinc-300 text-stone-600">
                  {detectWrongDescription}
                </div>
              </button>

              <button
                type="button"
                className={clsx(
                  'w-full text-left rounded-xl border p-3 transition-colors',
                  'dark:border-zinc-700 dark:hover:bg-zinc-800/70',
                  'border-stone-200 hover:bg-stone-100/80',
                )}
                onClick={() => onSelectReason('otherDevice')}
              >
                <div className="text-sm font-medium">
                  {otherDeviceActionText}
                </div>
                <div className="mt-1 text-xs dark:text-zinc-300 text-stone-600">
                  {otherDeviceDescription}
                </div>
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <GlowButton
                translucent
                bordered
                onClick={onClose}
                className="allin-download-button relative dark:text-white text-stone-800 isolate overflow-hidden *:relative *:z-10"
              >
                <span className="px-2 py-0.5 text-sm font-semibold">
                  {cancelText}
                </span>
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const CompatibilityFinalConfirmModal: FC<{
  open: boolean
  title: string
  message: ReactNode
  confirmText: string
  cancelText: string
  onClose: () => void
  onConfirm: () => void
}> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label={cancelText}
            className="absolute inset-0 bg-black/55"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'relative w-full max-w-lg rounded-2xl border p-5 shadow-2xl',
              'dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100',
              'bg-white border-stone-200 text-stone-900',
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                icon={mdiAlertCircle}
                className="mt-0.5 shrink-0 text-orange-500"
                width="22"
                height="22"
              />
              <div className="space-y-3">
                <h3 className="text-base font-semibold dark:text-zinc-50 text-stone-900">
                  {title}
                </h3>
                <p className="text-sm leading-6 dark:text-zinc-200 text-stone-700">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <GlowButton bordered onClick={onConfirm}>
                <span className="px-2 py-0.5 text-sm">{confirmText}</span>
              </GlowButton>
              <GlowButton
                translucent
                bordered
                onClick={onClose}
                className="allin-download-button relative isolate overflow-hidden *:relative *:z-10"
              >
                <span className="px-2 py-0.5 text-sm font-semibold">
                  {cancelText}
                </span>
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const FLEE_CLICK_LIMIT = 3
const FLEE_MIN_DISTANCE_RATIO = 0.3

function pickFleePosition(
  rect: DOMRect,
  minDistanceRatio: number,
): { x: number; y: number } {
  const margin = 20
  const startX = rect.left
  const startY = rect.top
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin)
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin)
  const minDistance =
    minDistanceRatio * Math.hypot(window.innerWidth, window.innerHeight)

  for (let i = 0; i < 32; i++) {
    const x = margin + Math.random() * (maxX - margin)
    const y = margin + Math.random() * (maxY - margin)
    if (Math.hypot(x - startX, y - startY) >= minDistance) {
      return { x: Math.floor(x), y: Math.floor(y) }
    }
  }

  const corners: [number, number][] = [
    [margin, margin],
    [maxX, margin],
    [margin, maxY],
    [maxX, maxY],
  ]
  let best = corners[0]
  let bestDist = Math.hypot(best[0] - startX, best[1] - startY)
  for (const corner of corners.slice(1)) {
    const dist = Math.hypot(corner[0] - startX, corner[1] - startY)
    if (dist > bestDist) {
      bestDist = dist
      best = corner
    }
  }
  return { x: Math.floor(best[0]), y: Math.floor(best[1]) }
}

function useFleeOnClick() {
  const flyRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const runCountRef = useRef(0)

  const resetFlyStyles = useCallback(() => {
    const fly = flyRef.current
    const placeholder = placeholderRef.current
    if (fly) {
      fly.style.position = ''
      fly.style.left = ''
      fly.style.top = ''
      fly.style.zIndex = ''
      fly.style.transition = ''
    }
    if (placeholder) {
      placeholder.style.width = ''
      placeholder.style.height = ''
    }
  }, [])

  const resetFlee = useCallback(() => {
    resetFlyStyles()
    runCountRef.current = 0
  }, [resetFlyStyles])

  const runAway = useCallback(() => {
    const fly = flyRef.current
    if (!fly || runCountRef.current >= FLEE_CLICK_LIMIT) {
      return
    }
    runCountRef.current += 1

    const rect = fly.getBoundingClientRect()
    const placeholder = placeholderRef.current
    if (placeholder) {
      placeholder.style.width = `${rect.width}px`
      placeholder.style.height = `${rect.height}px`
    }

    const { x: randX, y: randY } = pickFleePosition(
      rect,
      FLEE_MIN_DISTANCE_RATIO,
    )

    fly.style.position = 'fixed'
    fly.style.left = `${rect.left}px`
    fly.style.top = `${rect.top}px`
    fly.style.zIndex = '9999'
    fly.style.transition = 'none'

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fly.style.transition = 'left 0.3s ease, top 0.3s ease'
        fly.style.left = `${randX}px`
        fly.style.top = `${randY}px`
      })
    })
  }, [])

  const handleFleeClick = useCallback(
    (onSuccess: () => void) => {
      if (runCountRef.current < FLEE_CLICK_LIMIT) {
        runAway()
        return
      }
      onSuccess()
    },
    [runAway],
  )

  return {
    flyRef,
    placeholderRef,
    resetFlyStyles,
    resetFlee,
    handleFleeClick,
  }
}

const FleeButtonShell: FC<{
  flyRef: RefObject<HTMLDivElement | null>
  placeholderRef: RefObject<HTMLDivElement | null>
  className?: string
  children: ReactNode
}> = ({ flyRef, placeholderRef, className, children }) => (
  <div ref={placeholderRef} className={clsx('inline-flex', className)}>
    <div ref={flyRef} className="inline-flex">
      {children}
    </div>
  </div>
)

const AllPlatformsModal: FC<{
  open: boolean
  title: string
  warning: string
  onClose: () => void
  onConfirm: () => void
}> = ({ open, title, warning, onClose, onConfirm }) => {
  const { t } = useTranslation()
  const { flyRef, placeholderRef, resetFlee, handleFleeClick } =
    useFleeOnClick()

  useEffect(() => {
    if (!open) {
      resetFlee()
    }
  }, [open, resetFlee])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              'relative w-full max-w-2xl rounded-2xl border p-5 shadow-2xl',
              'dark:bg-zinc-900/95 dark:border-zinc-700 dark:text-zinc-100',
              'bg-white/95 border-stone-200 text-stone-900',
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold dark:text-zinc-50 text-stone-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-stone-200/60 dark:hover:bg-zinc-700/60 transition-colors"
              >
                <Icon
                  icon={mdiAlertCircle}
                  width="18"
                  height="18"
                  className="opacity-50"
                />
              </button>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <Icon
                icon={mdiAlertCircle}
                className="mt-0.5 shrink-0 text-orange-500"
                width="20"
                height="20"
              />
              <p className="text-sm leading-6 dark:text-zinc-200 text-stone-700">
                {warning}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <GlowButton translucent bordered onClick={onClose}>
                <span className="px-3 py-1 text-sm">
                  {t(
                    'release.platformDetect.archIncompatibleConfirm.actions.cancel',
                  )}
                </span>
              </GlowButton>
              <FleeButtonShell flyRef={flyRef} placeholderRef={placeholderRef}>
                <GlowButton bordered onClick={() => handleFleeClick(onConfirm)}>
                  <span className="px-3 py-1 text-sm">
                    {t(
                      'release.platformDetect.archIncompatibleConfirm.actions.confirm',
                    )}
                  </span>
                </GlowButton>
              </FleeButtonShell>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const DownloadButton: FC<{
  platform: ResolvedPlatform
  releaseName: string | null
  requiresCompatibilityConfirm?: boolean
  detectedPlatformLabel?: string | null
  isCurrentPlatform?: boolean
}> = ({
  platform,
  releaseName,
  requiresCompatibilityConfirm = false,
  detectedPlatformLabel,
  isCurrentPlatform = false,
}) => {
  const { t } = useTranslation()
  const href = platform.asset.browser_download_url

  const [loadState, setLoadState] = useState<DownloadDetectionStates>({
    state: 'idle',
  })
  const [compatibilityModalOpen, setCompatibilityModalOpen] = useState(false)
  const [finalConfirmReason, setFinalConfirmReason] =
    useState<CompatibilityConfirmReason | null>(null)

  const selectedPlatformLabel = useMemo(
    () => [t(platform.platform.title), t(platform.platform.subtitle)].join(' '),
    [platform.platform.subtitle, platform.platform.title, t],
  )
  const recommendedPlatformLabel = useMemo(
    () => detectedPlatformLabel || t('release.platformDetect.failure'),
    [detectedPlatformLabel, t],
  )
  const downloadMAA = () => {
    setLoadState({ state: 'downloading' })
    window.location.href = href
  }

  const handleDownloadClick = () => {
    if (requiresCompatibilityConfirm) {
      setFinalConfirmReason(null)
      setCompatibilityModalOpen(true)
      return
    }

    downloadMAA()
  }

  const handleCompatibilityConfirm = () => {
    if (!finalConfirmReason) {
      return
    }
    console.warn('download started with incompatible architecture', {
      reason: finalConfirmReason,
      selectedPlatformLabel,
      recommendedPlatformLabel,
    })
    setFinalConfirmReason(null)
    setCompatibilityModalOpen(false)
    downloadMAA()
  }

  const handleSelectCompatibilityReason = (
    reason: CompatibilityConfirmReason,
  ) => {
    setFinalConfirmReason(reason)
  }

  const handleCloseCompatibilityFlow = () => {
    setFinalConfirmReason(null)
    setCompatibilityModalOpen(false)
  }

  useEffect(() => {
    if (!compatibilityModalOpen && !finalConfirmReason) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFinalConfirmReason(null)
        setCompatibilityModalOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [compatibilityModalOpen, finalConfirmReason])

  if (loadState.state === 'idle') {
    return (
      <>
        <GlowButton
          bordered
          onClick={handleDownloadClick}
          className={clsx(
            downloadButtonClassName,
            isCurrentPlatform &&
              'allin-download-button relative isolate overflow-hidden dark:text-white text-stone-800 *:relative *:z-10',
          )}
        >
          <div className="flex flex-col items-start whitespace-nowrap">
            <div className="flex items-center -ml-1">
              <Icon icon={platform.platform.icon} fontSize="28px" />
              <span className="ml-2">
                {t(platform.platform.title)}
                <span className="mx-1 text-sm">
                  {t(platform.platform.subtitle)}
                </span>
                {t('release.buttonLabels.download')}
              </span>
            </div>
            <div className="flex items-center mt-1 mb-0.5 ml-8 text-sm">
              <span>{releaseName}</span>
              {platform.asset.download_count && (
                <>
                  <Icon icon={mdiDownload} className="ml-2 mr-0.5" />
                  <span>
                    {platform.asset.download_count
                      ? platform.asset.download_count.toLocaleString()
                      : '—'}
                  </span>
                </>
              )}
            </div>
          </div>
        </GlowButton>
        <CompatibilityConfirmModal
          open={compatibilityModalOpen && !finalConfirmReason}
          title={t('release.platformDetect.archIncompatibleConfirm.title')}
          warning={t('release.platformDetect.archIncompatibleConfirm.warning', {
            selected: selectedPlatformLabel,
            recommended: recommendedPlatformLabel,
          })}
          detectWrongActionText={t(
            'release.platformDetect.archIncompatibleConfirm.actions.detectWrong',
          )}
          detectWrongDescription={
            <Trans
              i18nKey="release.platformDetect.archIncompatibleConfirm.final.detectWrong"
              values={{
                selected: selectedPlatformLabel,
              }}
              components={{
                1: <strong className="font-semibold" />,
              }}
            />
          }
          otherDeviceActionText={t(
            'release.platformDetect.archIncompatibleConfirm.actions.otherDevice',
          )}
          otherDeviceDescription={
            <Trans
              i18nKey="release.platformDetect.archIncompatibleConfirm.final.otherDevice"
              values={{
                selected: selectedPlatformLabel,
              }}
              components={{
                1: <strong className="font-semibold" />,
              }}
            />
          }
          cancelText={t(
            'release.platformDetect.archIncompatibleConfirm.actions.cancel',
          )}
          onClose={handleCloseCompatibilityFlow}
          onSelectReason={handleSelectCompatibilityReason}
        />
        <CompatibilityFinalConfirmModal
          open={compatibilityModalOpen && !!finalConfirmReason}
          title={t('release.platformDetect.archIncompatibleConfirm.title')}
          message={
            finalConfirmReason === 'otherDevice' ? (
              <Trans
                i18nKey="release.platformDetect.archIncompatibleConfirm.final.otherDevice"
                values={{
                  selected: selectedPlatformLabel,
                }}
                components={{
                  1: <strong className="font-semibold" />,
                }}
              />
            ) : (
              <Trans
                i18nKey="release.platformDetect.archIncompatibleConfirm.final.detectWrong"
                values={{
                  selected: selectedPlatformLabel,
                }}
                components={{
                  1: <strong className="font-semibold" />,
                }}
              />
            )
          }
          confirmText={t(
            'release.platformDetect.archIncompatibleConfirm.actions.confirm',
          )}
          cancelText={t(
            'release.platformDetect.archIncompatibleConfirm.actions.cancel',
          )}
          onClose={handleCloseCompatibilityFlow}
          onConfirm={handleCompatibilityConfirm}
        />
      </>
    )
  } else if (loadState.state === 'downloading') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={
          <div className="flex items-center gap-4">
            <span>{t('release.download.downloadingFromGithub')}</span>
          </div>
        }
        className="tabular-nums"
        isCurrentPlatform={isCurrentPlatform}
      />
    )
  } else {
    return (
      <DownloadState
        icon={mdiAlertCircle}
        title={t('release.download.invalidState')}
        isCurrentPlatform={isCurrentPlatform}
      />
    )
  }
}

const ViewAllButton: FC<{
  viewAll: boolean
  label: string
  collapseLabel: string
  onExpand: () => void
  onCollapse: () => void
}> = ({ viewAll, label, collapseLabel, onExpand, onCollapse }) => {
  const { flyRef, placeholderRef, resetFlyStyles, handleFleeClick } =
    useFleeOnClick()

  useEffect(() => {
    if (viewAll) {
      resetFlyStyles()
    }
  }, [viewAll, resetFlyStyles])

  const handleClick = () => {
    if (viewAll) {
      onCollapse()
      return
    }

    handleFleeClick(onExpand)
  }

  return (
    <DownloadButtonColumn>
      <FleeButtonShell flyRef={flyRef} placeholderRef={placeholderRef}>
        <GlowButton bordered className="items-center" onClick={handleClick}>
          <div className="text-base">{viewAll ? collapseLabel : label}</div>
        </GlowButton>
      </FleeButtonShell>
    </DownloadButtonColumn>
  )
}

export const DownloadButtons: FC<{ release: Release }> = ({ release }) => {
  const { t } = useTranslation()
  const { isWidthOverflow } = useLayoutState()

  const [viewAll, setViewAll] = useState(false)
  const [allPlatformsModalOpen, setAllPlatformsModalOpen] = useState(false)
  const [envPlatformId, setCurrentPlatformId] = useState<
    string | typeof DetectionFailedSymbol | null
  >(null)

  useMount(async () => {
    const platformId = await detectPlatform()
    setCurrentPlatformId(platformId ?? null)
  })

  const validPlatforms = useMemo(
    () =>
      PLATFORMS.reduce((acc, platform) => {
        const asset = platform.assetMatcher(release)
        if (asset)
          acc.push({
            asset,
            platform,
          })
        return acc
      }, [] as ResolvedPlatform[]),
    [release],
  )

  const detectedPlatform = useMemo(
    () =>
      validPlatforms.find((platform) => platform.platform.id === envPlatformId),
    [envPlatformId, validPlatforms],
  )

  const detectedPlatformLabel = useMemo(() => {
    if (!detectedPlatform) {
      return null
    }

    return [
      t(detectedPlatform.platform.title),
      t(detectedPlatform.platform.subtitle),
    ]
      .filter(Boolean)
      .join(' ')
  }, [detectedPlatform, t])

  const renderPlatformButton = useCallback(
    (platform: ResolvedPlatform) => {
      const isCurrentPlatform = platform.platform.id === envPlatformId
      const shouldConfirmIncompatibleDownload =
        !!envPlatformId &&
        envPlatformId !== DetectionFailedSymbol &&
        !isCurrentPlatform

      return (
        <motion.div layout key={platform.platform.id}>
          <DownloadButtonColumn
            footer={
              !isCurrentPlatform ? (
                <motion.span
                  className="inline-flex items-center whitespace-nowrap text-red-500 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    viewAll ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
                  }
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: viewAll ? 0.3 : 0,
                  }}
                  style={{ display: 'inline-flex' }}
                >
                  <Icon
                    icon={mdiAlertCircle}
                    className="mr-1 shrink-0"
                    width="14"
                    height="14"
                  />
                  {t('release.platformDetect.archIncompatible')}
                </motion.span>
              ) : null
            }
          >
            <DownloadButton
              platform={platform}
              releaseName={release.name}
              requiresCompatibilityConfirm={shouldConfirmIncompatibleDownload}
              detectedPlatformLabel={detectedPlatformLabel}
              isCurrentPlatform={isCurrentPlatform}
            />
          </DownloadButtonColumn>
        </motion.div>
      )
    },
    [detectedPlatformLabel, envPlatformId, release.name, viewAll, t],
  )

  const innerContent = useMemo<React.ReactNode>(() => {
    if (!envPlatformId || envPlatformId === DetectionFailedSymbol) {
      // 检测失败
      return (
        <DownloadState
          key="detect-failed"
          icon={mdiAlertCircle}
          title={t('release.platformDetect.failure')}
        />
      )
    }

    const platform = validPlatforms.find(
      (platform) => platform.platform.id === envPlatformId,
    )

    if (!platform) {
      // 检测到但不支持
      return (
        <DownloadState
          key="unsupported"
          icon={mdiAlertCircle}
          title={t('release.platformDetect.failure')}
        />
      )
    }

    // 检测成功且支持
    return renderPlatformButton(platform)
  }, [validPlatforms, envPlatformId, renderPlatformButton, t])

  const [os, arch] = useMemo(() => {
    if (!envPlatformId) return ['unknown', 'unknown']
    return envPlatformId
      .toString()
      .replace(/macos-universal/i, 'macos-arm64')
      .split('-')
  }, [envPlatformId])

  const mirrorchyanAvailable = useMemo(() => {
    return os === 'windows' || os === 'macos'
  }, [os])

  if (!envPlatformId) {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={t('release.platformDetect.detecting')}
      />
    )
  }

  const mirrorchyanLang = getLanguageOption(i18n.language).mirrorchyanLang

  // 原来的逻辑是 当`ViewAll=true`时使用`allPlatformDownloadBtns`进行替换，把整个第一行（下载，查看全部，mirror酱）替换为全部平台的下载渠道按钮。
  // 下面的按钮因为`!viewAll`便不再渲染。我将渲染逻辑进行了修改，`ViewAll=true`时不再进行替换，而是根据其值展示和收起相关按钮。
  // 对原来的进行排版，原来只用一个`motion.div`将所有按钮放在了一起，现在将组件使用`AnimatePresence`进行分组并设置对应的动画。
  // 去掉了条件渲染，改为隐藏和显示相关按钮。
  return (
    // 外层容器：改为纵向排列 (flex-col)，负责控制上下两排的整体高度和间距
    <motion.div
      layout="position" // ✅ 防止高度参与 layout 计算
      className="w-full flex flex-col justify-center items-center gap-x-4 max-h-[50vh]"
    >
      {/* 第一排 */}
      <motion.div
        layout
        className="w-full flex flex-wrap justify-center items-center gap-4"
      >
        <AnimatePresence mode="popLayout">
          {innerContent}

          {mirrorchyanAvailable && (
            <motion.div
              layout
              key="mirrorchyan"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <DownloadButtonColumn>
                <GlowButton
                  bordered
                  className={downloadButtonClassName}
                  href={`https://mirrorchyan.com/${mirrorchyanLang}/projects?rid=MAA&os=${os}&arch=${arch}&channel=stable&source=maaplus-download`}
                >
                  <div className="text-sm">
                    <p>
                      <i>{t('release.buttonLabels.mirrorchyanCDKPrompt')}</i>
                    </p>
                    <p>
                      <i>{t('release.buttonLabels.mirrorchyanDownload')}</i>
                    </p>
                  </div>
                </GlowButton>
              </DownloadButtonColumn>
            </motion.div>
          )}

          {/* view all 按钮 */}
          <motion.div
            layout
            key="view-all-switch"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center gap-4 ${isWidthOverflow ? 'flex-col w-full' : ''}`}
          >
            <ViewAllButton
              viewAll={viewAll}
              label={t('release.buttonLabels.viewAll')}
              collapseLabel={t('release.buttonLabels.collapse')}
              onExpand={() => setAllPlatformsModalOpen(true)}
              onCollapse={() => setViewAll(false)}
            />
            <AllPlatformsModal
              open={allPlatformsModalOpen}
              title={t('release.buttonLabels.viewAllPlatforms')}
              warning={t('release.buttonLabels.viewAllWarning')}
              onClose={() => setAllPlatformsModalOpen(false)}
              onConfirm={() => {
                setAllPlatformsModalOpen(false)
                setViewAll(true)
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
      {/* 原先的条件渲染会导致dom出现和消失，因此父容器在做layout动画的同时，子元素在做height动画。动画结束后，dom消失，layout再次计算位置进行跳跃。*/}
      {/*这里便把条件渲染给去掉了，改成根据`viewAll`的值使用不同的动画。*/}
      <motion.div
        key="view-all-content"
        initial={false} // ✅ 防止首次动画
        animate={
          viewAll
            ? { opacity: 1, height: 'auto', overflow: 'visible' }
            : { opacity: 0, height: 0, overflow: 'hidden' }
        }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full flex flex-wrap justify-center gap-4"
      >
        {validPlatforms
          .filter((p) => p.platform.id !== envPlatformId)
          .map(renderPlatformButton)}
      </motion.div>
    </motion.div>
  )
}

interface Props extends WithTranslation {
  children?: React.ReactNode
}

export const HomeActionsReleaseErrorBoundary: ComponentType<
  Pick<Props, 'children'>
> = withTranslation()(
  class HomeActionsReleaseErrorBoundary extends Component<Props> {
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
          <DownloadState
            icon={mdiAlertCircle}
            title={
              <div className="flex flex-col ml-4">
                <Trans
                  key={i18n.language}
                  i18nKey="release.buttonLabels.versionInfoLoadingError"
                  components={{
                    1: <span className="mb-2 block text-center" />,
                    2: (
                      <GlowButton
                        className="mb-2"
                        translucent
                        bordered
                        href="https://github.com/MaaAssistantArknights/MaaAssistantArknights/releases"
                      >
                        <span className="text-sm" />
                      </GlowButton>
                    ),
                  }}
                />
              </div>
            }
          />
        )
      }

      return this.props.children
    }
  },
)

export const HomeActionsRelease: FC = () => {
  const { data } = useRelease()
  return <>{data && <DownloadButtons release={data} />}</>
}
