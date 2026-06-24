import clsx from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'

// 每个色斑的颜色、位置与漂移动画集中在一处维护，避免多个数组靠下标对齐。
// 配色：玫红 → 紫 → 蓝 → 青，平滑的色相过渡，比原先的红橙蓝青更和谐。
// 漂移：各色斑错开相位、缓慢持续流动；位移幅度需与背景模糊半径（blur-[9rem]≈144px）
// 相当，否则在强模糊下看不出移动。
const blobs = [
  {
    color: 'dark:bg-rose-900 bg-rose-200',
    pos: 'left-[30%] translate-y-36',
    float: {
      x: [0, 160, -120, 40, 0],
      y: [0, -130, 90, -40, 0],
      scale: [1, 1.25, 0.85, 1.1, 1],
      duration: 16,
    },
  },
  {
    color: 'dark:bg-violet-900 bg-violet-200',
    pos: 'left-[45%] translate-y-1',
    float: {
      x: [0, -150, 110, -60, 0],
      y: [0, 120, -100, 50, 0],
      scale: [1, 0.85, 1.22, 0.92, 1],
      duration: 19,
    },
  },
  {
    color: 'dark:bg-blue-900 bg-blue-200',
    pos: 'left-[55%] -translate-y-40',
    float: {
      x: [0, 130, -160, 70, 0],
      y: [0, -110, 130, -60, 0],
      scale: [1, 1.2, 0.86, 1.12, 1],
      duration: 17,
    },
  },
  {
    color: 'dark:bg-cyan-900 bg-cyan-200',
    pos: 'left-[68%] translate-y-20',
    float: {
      x: [0, -170, 100, -50, 0],
      y: [0, 140, -90, 60, 0],
      scale: [1, 0.88, 1.25, 0.9, 1],
      duration: 21,
    },
  },
]

export function AnimatedBlobs() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="absolute h-full w-full overflow-hidden transform-gpu blur-[9rem] -left-40 -top-40">
      {blobs.map((blob, i) => (
        <div key={i} className={clsx('absolute top-[50vh]', blob.pos)}>
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            <motion.div
              className={clsx('h-80 w-[20rem] rounded-full', blob.color)}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      x: blob.float.x,
                      y: blob.float.y,
                      scale: blob.float.scale,
                    }
              }
              transition={{
                duration: blob.float.duration,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  )
}
