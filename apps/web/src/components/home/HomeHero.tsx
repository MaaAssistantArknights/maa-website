import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'
import { FC, forwardRef, useRef } from 'react'

import { AnimatedBlobs } from './AnimatedBlobs/AnimatedBlobs'
import { HomeActions } from './HomeActions/HomeActions'
import { HomeHeroHeader } from './HomeHeroHeader/HomeHeroHeader'
import { HomeLinks } from './HomeLinks/HomeLinks'
import { Screenshots } from './Screenshots/Screenshots'

export const HomeHero: FC = () => {
  const linkRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  return (
    <>
      <AnimatedBlobs />
      <div className="absolute h-full w-full flex items-center">
        <section className="h-[100vmin] w-full relative">
          <ScreenshotsCanvas sidebarRef={linkRef} indicatorRef={indicatorRef} />
        </section>
      </div>
      <HomeHeroHeader />
      <HomeActions />
      <HomeLinks ref={linkRef} />
      <HomeIndicator ref={indicatorRef} />
    </>
  )
}

const HomeIndicator = forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    className="fixed right-[4vw] top-[50vh] pointer-events-none select-none hidden md:block"
    ref={ref}
  >
    <div className="-rotate-90 text-white/10 text-8xl font-light">友情链接</div>
  </div>
))

function ScreenshotsCanvas({
  sidebarRef,
  indicatorRef,
}: {
  sidebarRef: React.MutableRefObject<HTMLDivElement | null>
  indicatorRef: React.MutableRefObject<HTMLDivElement | null>
}) {
  return (
    <Canvas shadows camera={{ fov: 35, position: [0, -1, 11] }} flat linear>
      <EffectComposer>
        <Vignette
          offset={0.1} // vignette offset
          darkness={0.7} // vignette darkness
          eskil={false} // Eskil's vignette technique
          blendFunction={BlendFunction.DARKEN} // blend mode
        />
        <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} />
      </EffectComposer>
      <ambientLight intensity={1} />
      <Screenshots sidebarRef={sidebarRef} indicatorRef={indicatorRef} />
    </Canvas>
  )
}
