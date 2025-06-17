import { useCallback, useEffect, useRef } from 'react'
import ReactCanvasConfetti from 'react-canvas-confetti'

export default function Confetti() {
  const refAnimationInstance = useRef(null)

  const getInstance = useCallback((instance: any) => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = useCallback((particleRatio: any, opts: any) => {
    refAnimationInstance.current &&
      // @ts-ignore
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio)
      })
  }, [])

  useEffect(() => fire(), [])

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55
    })

    makeShot(0.2, {
      spread: 60
    })

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45
    })
  }, [makeShot])

  return (
    <ReactCanvasConfetti
      // @ts-ignore
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
      }}
    />
  )
}

// // import { get, writable } from 'svelte/store'

// const height = 600
// const colors = [0xffb636, 0x35f0d0, 0xfa48e8, 0x5d3a97]
// let confettiSVG = `<svg
//     class="confetti"
//     viewBox="0 0 ${height} ${height}"
//     xmlns="http://www.w3.org/2000/svg"
//     xmlns:svg="http://www.w3.org/2000/svg"
//     version="1.1"
//   >`
// for (let i = 0; i < 300; i++) {
//   const color = colors[Math.floor(Math.random() * colors.length)]
//   const colorStr = '#' + (color | 0x111111).toString(16)
//   const x = (10 + Math.random() * (height - 20)).toFixed(4)
//   const y = (10 + Math.random() * (height - 20)).toFixed(4)
//   confettiSVG += `
//   <g>
//     <rect x="0" y="0" width="20" height="10" fill="${colorStr}" fill-opacity="1.0" visibility="visible">
//       <animate
//         attributeType="XML"
//         attributeName="height"
//         begin="-${Math.random().toFixed(4)}s"
//         values="8;0;8"
//         dur="0.3s"
//         repeatCount="indefinite" />
//       <animate
//         attributeType="XML"
//         attributeName="fill"
//         values="${colorStr};#${(Math.floor(color / 4) | 0x111111).toString(16)};${colorStr}"
//         dur="0.2s"
//         repeatCount="indefinite" />
//       <animate
//         attributeType="XML"
//         attributeName="fill-opacity"
//         begin="0s"
//         values="1.0;0.0"
//         dur="4s"
//         fill="freeze" />
//       <animateTransform
//         attributeName="transform"
//         attributeType="XML"
//         type="rotate"
//         values="0 5 0;${(10 + Math.random() * 60).toFixed(4)} 3 0;-${(
//     10 +
//     Math.random() * 60
//   ).toFixed(4)} 8 0;0 10 0"
//         dur="${(0.2 + Math.random() * 0.5).toFixed(4)}s"
//         repeatCount="indefinite" />
//     </rect>
//     <animateTransform
//       attributeName="transform"
//       attributeType="XML"
//       type="translate"
//       begin="0s"
//       end="0.5s"
//       dur="0.5s"
//       values="${height / 2} ${height / 2};${x} ${y}"
//       calcMode="spline"
//       keySplines="0.25 0.8 0.3 1"/>
//     <animateTransform
//       attributeName="transform"
//       attributeType="XML"
//       type="translate"
//       begin="0.5s"
//       from="${x} ${y}"
//       to="${x} ${height - 10}"
//       dur="${(5 + Math.random() * 3).toFixed(4)}s"/>
//   </g>`
// }
// confettiSVG += '</svg>'

// // Confetti state:
// const confettiAnimations = new Set<NodeJS.Timeout>()
// // const confettiAnimations = writable(new Set<NodeJS.Timeout>())
// export const playConfetti = () => {
//   // for (const animationId of [...get(confettiAnimations)]) {
//   //   clearTimeout(animationId)
//   //   confettiAnimations.update((x) => {
//   //     x.delete(animationId)
//   //     return x
//   //   })
//   // }
//   const confettiTimeout = setTimeout(() => {
//     confettiAnimations.update((x) => {
//       x.delete(confettiTimeout)
//       return x
//     })
//   }, 5000)
//   confettiAnimations.update((x: any) => x.add(confettiTimeout))
// }

// // {#each [...$confettiAnimations] as confettiId}
// //   {#key confettiId}
// //     {@html confettiSVG}
// //   {/key}
// // {/each}

// {
//   /* <style>
//   :global(svg.confetti) {
//     position: fixed;
//     left: 50%;
//     top: 50%;
//     transform: translate(-50%, -60%);
//     user-select: none;
//     pointer-events: none;
//     min-width: 110vw;
//     min-height: 110vh;
//     animation: 4s 1 forwards fade;
//   }
// </style> */
// }
