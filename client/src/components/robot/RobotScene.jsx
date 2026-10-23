import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import FlyBotRobot from "./FlyBotRobot";

/**
 * The actual WebGL canvas. Kept in its own module so it can be lazy-loaded
 * (three.js is a heavy dependency and should not block first paint).
 */
const RobotScene = ({ hovered = false, framing = "bust", quality = "high", onReady }) => {
  const dpr =
    quality === "low" ? [1.25, 1.5] : quality === "medium" ? [1.5, 2] : [1.5, 2.25];

  return (
    <Canvas
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: quality !== "low",
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      camera={{ position: [0, 0.72, 4.9], fov: 32, near: 0.1, far: 40 }}
      onCreated={() => onReady?.()}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <Suspense fallback={null}>
        <FlyBotRobot hovered={hovered} framing={framing} />
      </Suspense>
    </Canvas>
  );
};

export default RobotScene;
