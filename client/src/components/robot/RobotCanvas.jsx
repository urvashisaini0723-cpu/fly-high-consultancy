import { Component, Suspense, lazy, useEffect, useState } from "react";
import RobotFallback from "./RobotFallback";

const LazyRobotScene = lazy(() => import("./RobotScene"));

/* ------------------------------------------------------------------
   WebGL capability check (cheap, runs once)
------------------------------------------------------------------ */
let cachedSupport = null;
const detectWebGL = () => {
  if (cachedSupport !== null) return cachedSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cachedSupport = Boolean(gl && typeof gl.getParameter === "function");
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
};

/* ------------------------------------------------------------------
   Error boundary – if three.js throws, fall back to the SVG robot
------------------------------------------------------------------ */
class RobotErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[FlyBot] 3D robot failed, using SVG fallback:", error?.message);
    }
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

/* True when the device should get the lightweight static robot instead of the
   ~900 kB three.js scene: phones/small tablets, data-saver or very slow links.
   Desktop still gets the full 3D + breathing animation. */
const shouldUseStaticRobot = () => {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 768) return true;
  const conn = navigator.connection;
  if (conn?.saveData === true) return true;
  const et = conn?.effectiveType;
  if (et && (et === "2g" || et === "slow-2g" || et === "3g")) return true;
  // very weak machines: static robot instead of a 900 kB WebGL scene
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return true;
  return false;
};

/* ------------------------------------------------------------------
   Public component
------------------------------------------------------------------ */
const RobotCanvas = ({
  hovered = false,
  framing = "bust",
  quality = "high",
  className = "",
  fallbackClassName = "",
}) => {
  const [supported, setSupported] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* WebGL check only runs in the browser */
  useEffect(() => {
    setSupported(detectWebGL() && !shouldUseStaticRobot());
  }, []);

  /* Defer the heavy three.js chunk until the page has painted and is idle,
     so it never competes with the first render of the site. */
  useEffect(() => {
    if (!supported) return undefined;

    let timer;
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => setShouldLoad(true), { timeout: 1200 });
      } else {
        timer = window.setTimeout(() => setShouldLoad(true), 400);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (timer) window.clearTimeout(timer);
    };
  }, [supported]);

  const fallback = <RobotFallback className={fallbackClassName} />;

  if (!supported) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className} aria-hidden="true">
      <div className="relative h-full w-full">
        {/* lightweight first paint / failure state */}
        {!mounted && (
          <div className="absolute inset-0 flex items-center justify-center">
            {fallback}
          </div>
        )}

        {shouldLoad && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            <RobotErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <LazyRobotScene
                  hovered={hovered}
                  framing={framing}
                  quality={quality}
                  onReady={() => setMounted(true)}
                />
              </Suspense>
            </RobotErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobotCanvas;
