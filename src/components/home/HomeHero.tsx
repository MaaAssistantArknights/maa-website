import { FC } from "react";
import { Canvas } from "@react-three/fiber";
import { Screenshots } from "./Screenshots/Screenshots";
import { AnimatedBlobs } from "./AnimatedBlobs/AnimatedBlobs";
import { HomeHeroHeader } from "./HomeHeroHeader/HomeHeroHeader";
import { HomeActions } from "./HomeActions/HomeActions";
import {
  Bloom,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Stats } from "@react-three/drei";

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
    <Canvas
      shadows
      camera={{ fov: 35, position: [0, 0, 11] }}
      flat
      linear
    >
      <EffectComposer>
        <Vignette
          offset={0.1} // vignette offset
          darkness={1} // vignette darkness
          eskil={false} // Eskil's vignette technique
          blendFunction={BlendFunction.NORMAL} // blend mode
        />
        <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} />
      </EffectComposer>
      <ambientLight intensity={1} />
      <Screenshots />
    </Canvas>
  );
}
