import React, { useEffect } from "react";
import Vector2D from "./Vector2D";
import Pollock from "./Pollock";
import Drip from "./Drip";

const WatercolorBGCanvas: React.FC = () => {
  useEffect(() => {
    const addDrip = (scene: any, point?: any) => {
      const colors = [
        "#1abc9c",
        "#d35400",
        "#34495e",
        "#e74c3c",
        "#16a085",
        "#3498db",
        "#2c3e50",
        "#9b59b6",
        "#f1c40f",
        "#2980b9",
        "#f39c12",
        "#8e44ad",
        "#2ecc71",
        "#c0392b",
        "#27ae60",
        "#e67e22",
      ];

      point = new Vector2D(
        Pollock.randomInRange(0, scene.width),
        Pollock.randomInRange(0, scene.height)
      );
      var drip = new Drip({
        lifeSpan: Pollock.randomInRange(800, 3000),
        position: point,
        velocity: new Vector2D(Math.random() * 15, Math.random() * 15),
        color:
          Math.random() < 0.2
            ? "#fafafa"
            : colors[Pollock.randomInRange(0, colors.length - 1)],
        size: Pollock.randomInRange(7, 17),
      });

      scene.addChild(drip);
    };

    const initPollock = () => {
      let scene = new Pollock({
        canvasID: "watercolor-bg-canvas",
        clear: false,
      });

      scene.enable();

      setInterval(() => {
        addDrip(scene);
      }, 500);
    };

    initPollock();
  }, []);

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 watercolor-bg-canvas-wrapper">
      <canvas
        id="watercolor-bg-canvas"
        className="w-full h-full filter blur-xl contrast-150 brightness-125"
      />
      <style jsx>{`
        .watercolor-bg-canvas-wrapper {
          z-index: -1;
        }
      `}</style>
    </div>
  );
};

export default WatercolorBGCanvas;
