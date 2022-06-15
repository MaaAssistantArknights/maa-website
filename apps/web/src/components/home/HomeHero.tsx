import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { FC } from 'react';
import { AnimatedBlobs } from './AnimatedBlobs/AnimatedBlobs';
import { HomeActions } from './HomeActions/HomeActions';
import { HomeHeroHeader } from './HomeHeroHeader/HomeHeroHeader';
import { Screenshots } from './Screenshots/Screenshots';

export const HomeHero: FC = () => {
  return (
    <>
      <AnimatedBlobs />
      <div className="absolute h-full w-full flex items-center">
        <section className="h-[100vmin] w-full relative">
          <ScreenshotsCanvas />
        </section>
      </div>
      <HomeHeroHeader />
      <HomeActions />
    </>
  );
};

function ScreenshotsCanvas() {
  return (
    <Canvas shadows camera={{ fov: 35, position: [0, 0, 11] }} flat linear>
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
      <Screenshots />
    </Canvas>
  );
}
