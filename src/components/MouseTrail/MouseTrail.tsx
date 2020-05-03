import React, { useState, useRef, useEffect } from "react"
import styles from "./MouseTrail.module.scss"

/* Mouse trail adapted from a jQuery Codepen by Bryan C https://codepen.io/bryjch/pen/QEoXwA */

class Point {
  x: number
  y: number
  lifetime: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.lifetime = 0
  }
}

function Canvas() {
  const [{ cHeight, cWidth }, setSize] = useState({ cHeight: 0, cWidth: 0 })
  const canvasRef = useRef<any>()

  const startAnimation = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const points: any[] = []

    const addPoint = (x, y) => {
      const point = new Point(x, y)
      points.push(point)
    }

    document.addEventListener(
      "mousemove",
      ({ clientX, clientY }) => {
        addPoint(clientX - canvas.offsetLeft, clientY - canvas.offsetTop)
      },
      false
    )

    const animatePoints = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const duration = (0.7 * (1 * 1000)) / 60 // Last 80% of a frame per point

      for (let i = 0; i < points.length; ++i) {
        const point = points[i]
        let lastPoint: any

        if (points[i - 1] !== undefined) {
          lastPoint = points[i - 1]
        } else lastPoint = point

        point.lifetime += 1

        if (point.lifetime > duration) {
          // If the point dies, remove it.
          points.shift()
        } else {
          // Otherwise animate it:

          // As the lifetime goes on, lifePercent goes from 0 to 1.
          const lifePercent = point.lifetime / duration
          const spreadRate = 7 * (1 - lifePercent)

          ctx.lineJoin = "round"
          ctx.lineWidth = spreadRate

          // As time increases decrease r and b, increase g to go from purple to green.
          const red = Math.floor(127 - (127 * lifePercent) / 2)
          const green = Math.floor(127 - (127 * lifePercent) / 2)
          const blue = Math.floor(127 - (127 * lifePercent) / 2)
          ctx.strokeStyle = `rgb(${red},${green},${blue}`

          ctx.beginPath()

          ctx.moveTo(lastPoint.x, lastPoint.y)
          ctx.lineTo(point.x, point.y)

          // Unfortunately there's no way to make smoother angles https://stackoverflow.com/a/40653054/2070793

          ctx.stroke()
          ctx.closePath()
        }
      }
      requestAnimationFrame(animatePoints)
    }

    animatePoints()
  }

  useEffect(() => {
    // Set height and width on load because if set in state body isn't defined yet.
    setSize({
      cHeight: window.innerHeight,
      cWidth: window.innerWidth,
    })

    window.addEventListener(
      "resize",
      () => {
        setSize({
          cHeight: window.innerHeight,
          cWidth: window.innerWidth,
        })
      },
      false
    )

    // If the device supports cursors, start animation.
    if (matchMedia("(pointer:fine)").matches) {
      startAnimation()
    }
  }, [])

  return (
    <canvas
      className={styles.mouseTrail}
      ref={canvasRef}
      width={cWidth}
      height={cHeight}
    />
  )
}

export default Canvas
