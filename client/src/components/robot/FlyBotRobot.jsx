import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RoundedBox,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";

/* ------------------------------------------------------------------
   Palette
------------------------------------------------------------------ */
const PEARL = "#f7f8fc";
const PURPLE = "#8b5cf6";
const VIOLET = "#6d28d9";
const LAVENDER = "#c4b5fd";
const CYAN = "#5ee9ff";
const SCREEN = "#060b1c";
const DARK = "#0f172e";

/* ------------------------------------------------------------------
   Small helpers
------------------------------------------------------------------ */
const lerp = (a, b, t) => a + (b - a) * t;

const easeTo = (current, target, speed) => lerp(current, target, speed);

/* ------------------------------------------------------------------
   Camera framing
------------------------------------------------------------------ */
function CameraRig({ framing }) {
  const { camera } = useThree();

  useEffect(() => {
    if (framing === "full") {
      camera.position.set(0, 0.42, 6.6);
      camera.fov = 30;
      camera.lookAt(0, 0.42, 0);
    } else if (framing === "avatar") {
      camera.position.set(0, 1.22, 3.45);
      camera.fov = 32;
      camera.lookAt(0, 1.22, 0);
    } else {
      camera.position.set(0, 0.72, 4.7);
      camera.fov = 32;
      camera.lookAt(0, 0.72, 0);
    }
    camera.updateProjectionMatrix();
  }, [camera, framing]);

  return null;
}

/* ------------------------------------------------------------------
   Eye (glowing capsule + specular highlight)
------------------------------------------------------------------ */
function Eye({ position, side = 1, eyeRef, highlightRef }) {
  return (
    <group position={position} rotation={[0, 0, side * 0.045]}>
      {/* dark socket */}
      <RoundedBox args={[0.34, 0.28, 0.05]} radius={0.13} smoothness={5}>
        <meshStandardMaterial color={DARK} roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* glowing iris */}
      <RoundedBox
        args={[0.3, 0.24, 0.045]}
        radius={0.115}
        smoothness={5}
        position={[0, 0, 0.012]}
        ref={eyeRef}
      >
        <meshStandardMaterial
          color="#0a2a3d"
          emissive={CYAN}
          emissiveIntensity={3.4}
          roughness={0.12}
          metalness={0.15}
          toneMapped={false}
        />
      </RoundedBox>

      {/* soft inner core */}
      <RoundedBox
        args={[0.13, 0.1, 0.02]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.035, 0.034]}
      >
        <meshBasicMaterial color="#b8f7ff" transparent opacity={0.55} toneMapped={false} />
      </RoundedBox>

      {/* reflection highlight */}
      <mesh position={[-0.062 * side, 0.062, 0.042]} ref={highlightRef}>
        <sphereGeometry args={[0.042, 18, 18]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* secondary glint */}
      <mesh position={[0.07 * side, -0.05, 0.042]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#e8feff" toneMapped={false} />
      </mesh>

      {/* cyan bloom spill on the screen */}
      <pointLight
        color={CYAN}
        intensity={0.16}
        distance={0.75}
        position={[0, 0, 0.16]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------
   Arm
------------------------------------------------------------------ */
function Arm({ side = 1, armRef }) {
  return (
    <group
      ref={armRef}
      position={[side * 0.63, 0.36, 0]}
      rotation={[0, 0, side * 0.16]}
    >
      {/* shoulder joint */}
      <mesh>
        <sphereGeometry args={[0.185, 26, 26]} />
        <meshPhysicalMaterial
          color={PURPLE}
          roughness={0.24}
          metalness={0.42}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* upper arm */}
      <mesh position={[0, -0.27, 0]}>
        <capsuleGeometry args={[0.125, 0.32, 12, 26]} />
        <meshPhysicalMaterial
          color={PEARL}
          roughness={0.14}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.15}
        />
      </mesh>

      {/* elbow */}
      <mesh position={[0, -0.49, 0]}>
        <sphereGeometry args={[0.135, 24, 24]} />
        <meshPhysicalMaterial
          color={LAVENDER}
          roughness={0.28}
          metalness={0.35}
          clearcoat={1}
        />
      </mesh>

      {/* forearm */}
      <mesh position={[0, -0.71, 0]}>
        <capsuleGeometry args={[0.112, 0.28, 12, 24]} />
        <meshPhysicalMaterial
          color={PEARL}
          roughness={0.14}
          metalness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.15}
        />
      </mesh>

      {/* wrist ring */}
      <mesh position={[0, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.105, 0.026, 12, 28]} />
        <meshPhysicalMaterial
          color={VIOLET}
          roughness={0.3}
          metalness={0.55}
          emissive={VIOLET}
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* hand */}
      <RoundedBox
        args={[0.235, 0.235, 0.205]}
        radius={0.095}
        smoothness={5}
        position={[0, -1.03, 0]}
      >
        <meshPhysicalMaterial
          color={PEARL}
          roughness={0.16}
          metalness={0.07}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.15}
        />
      </RoundedBox>

      {/* knuckle glow */}
      <mesh position={[0, -1.03, 0.1]}>
        <sphereGeometry args={[0.032, 14, 14]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------
   Leg
------------------------------------------------------------------ */
function Leg({ side = 1 }) {
  return (
    <group position={[side * 0.29, -0.62, 0]}>
      {/* hip */}
      <mesh>
        <sphereGeometry args={[0.155, 22, 22]} />
        <meshPhysicalMaterial
          color={PURPLE}
          roughness={0.26}
          metalness={0.4}
          clearcoat={1}
        />
      </mesh>

      {/* leg */}
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.135, 0.26, 10, 24]} />
        <meshPhysicalMaterial
          color={PEARL}
          roughness={0.15}
          metalness={0.06}
          clearcoat={1}
          envMapIntensity={1.1}
        />
      </mesh>

      {/* ankle */}
      <mesh position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.115, 20, 20]} />
        <meshPhysicalMaterial
          color={LAVENDER}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* foot */}
      <RoundedBox
        args={[0.31, 0.17, 0.45]}
        radius={0.075}
        smoothness={5}
        position={[0, -0.52, 0.07]}
      >
        <meshPhysicalMaterial
          color={PEARL}
          roughness={0.16}
          metalness={0.07}
          clearcoat={1}
          envMapIntensity={1.1}
        />
      </RoundedBox>

      {/* sole */}
      <RoundedBox
        args={[0.29, 0.05, 0.43]}
        radius={0.024}
        smoothness={4}
        position={[0, -0.6, 0.07]}
      >
        <meshPhysicalMaterial color={VIOLET} roughness={0.4} metalness={0.35} />
      </RoundedBox>
    </group>
  );
}

/* ------------------------------------------------------------------
   The robot
------------------------------------------------------------------ */
export default function FlyBotRobot({ hovered = false, framing = "bust" }) {
  const root = useRef(null);
  const head = useRef(null);
  const torso = useRef(null);
  const rightArm = useRef(null);
  const leftArm = useRef(null);
  const blinkGroup = useRef(null);
  const antennaGlow = useRef(null);
  const chestGlow = useRef(null);
  const antennaLight = useRef(null);
  const cheekLeft = useRef(null);
  const cheekRight = useRef(null);
  const smileRef = useRef(null);
  const allowMotion = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    allowMotion.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state) => {
    if (!allowMotion.current) return;
    const t = state.clock.elapsedTime;

    /* --- gentle float --- */
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.15) * 0.05;
      root.current.rotation.y = Math.sin(t * 0.42) * 0.11;
      root.current.rotation.x = Math.sin(t * 0.55) * 0.02;
    }

    /* --- head tilt / look --- */
    if (head.current) {
      const tilt = hovered ? 0.13 + Math.sin(t * 3.4) * 0.06 : Math.sin(t * 0.75) * 0.03;
      head.current.rotation.z = easeTo(head.current.rotation.z, tilt, 0.09);

      const turn = hovered ? Math.sin(t * 2.2) * 0.16 : Math.sin(t * 0.55) * 0.09;
      head.current.rotation.y = easeTo(head.current.rotation.y, turn, 0.06);
    }

    /* --- breathing --- */
    if (torso.current) {
      const breathe = 1 + Math.sin(t * 1.55) * 0.014;
      torso.current.scale.set(breathe, breathe, breathe);
    }

    /* --- blink --- */
    if (blinkGroup.current) {
      const cycle = t % 4.6;
      const blink = cycle > 4.28 ? 1 - Math.sin(((cycle - 4.28) / 0.32) * Math.PI) : 1;
      const next = easeTo(blinkGroup.current.scale.y, Math.max(0.08, blink), 0.45);
      blinkGroup.current.scale.y = next;
    }

    /* --- waving arm --- */
    if (rightArm.current) {
      // positive Z swings the right arm outward and up next to the head
      const wave = hovered ? 2.2 + Math.sin(t * 9.5) * 0.22 : 0.16;
      rightArm.current.rotation.z = easeTo(
        rightArm.current.rotation.z,
        wave,
        hovered ? 0.14 : 0.08
      );
      rightArm.current.rotation.x = easeTo(
        rightArm.current.rotation.x,
        hovered ? -0.25 : 0,
        0.1
      );
    }

    if (leftArm.current) {
      leftArm.current.rotation.z = easeTo(
        leftArm.current.rotation.z,
        hovered ? -0.34 : -0.16,
        0.08
      );
    }

    /* --- antenna pulse --- */
    if (antennaGlow.current) {
      const pulse = 2.2 + Math.sin(t * 2.5) * 0.9;
      antennaGlow.current.material.emissiveIntensity = pulse;
      antennaGlow.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.07);
    }
    if (antennaLight.current) {
      antennaLight.current.intensity = 0.55 + Math.sin(t * 2.5) * 0.28;
    }

    /* --- smile pulse --- */
    if (smileRef.current) {
      const smileScale = 1 + Math.sin(t * 1.8) * 0.06;
      smileRef.current.scale.set(smileScale, smileScale, 1);
    }

    /* --- chest core pulse --- */
    if (chestGlow.current) {
      chestGlow.current.material.emissiveIntensity = 1.5 + Math.sin(t * 1.9) * 0.5;
      chestGlow.current.rotation.z = t * 0.35;
    }

    /* --- cheek blush flicker --- */
    const cheekOpacity = 0.35 + Math.sin(t * 1.3) * 0.12;
    [cheekLeft, cheekRight].forEach((c) => {
      if (c.current) c.current.material.opacity = cheekOpacity;
    });
  });

  return (
    <>
      <CameraRig framing={framing} />

      {/* lighting */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[3.2, 5, 4]} intensity={1.75} color="#ffffff" />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.85} color="#a78bfa" />
      <pointLight position={[2.5, 0.2, 2.6]} intensity={0.75} color="#67e8f9" distance={9} />
      <pointLight position={[-2.4, 1.6, 2.2]} intensity={0.55} color="#c084fc" distance={9} />

      {/* procedural studio environment (no network requests) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.8}
          position={[3, 4, 3]}
          scale={[6, 6, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={1.7}
          position={[-4, 2, 2]}
          scale={[5, 5, 1]}
          color="#c4b5fd"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, -3, 3]}
          scale={[6, 3, 1]}
          color="#67e8f9"
        />
        <Lightformer
          form="ring"
          intensity={2.2}
          position={[-2.5, 3, -3]}
          scale={3}
          color="#a78bfa"
        />
      </Environment>

      <group ref={root} scale={1}>
        {/* ============ HEAD ============ */}
        <group ref={head} position={[0, 1.16, 0]}>
          {/* helmet */}
          <RoundedBox args={[1.46, 1.1, 1.2]} radius={0.44} smoothness={9}>
            <meshPhysicalMaterial
              color={PEARL}
              roughness={0.12}
              metalness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={1.35}
            />
          </RoundedBox>

          {/* visor frame */}
          <RoundedBox
            args={[1.26, 0.8, 0.1]}
            radius={0.32}
            smoothness={7}
            position={[0, 0.0, 0.56]}
          >
            <meshPhysicalMaterial
              color={LAVENDER}
              roughness={0.28}
              metalness={0.45}
              clearcoat={1}
            />
          </RoundedBox>

          {/* dark glass face screen */}
          <RoundedBox
            args={[1.15, 0.71, 0.12]}
            radius={0.29}
            smoothness={8}
            position={[0, 0.0, 0.6]}
          >
            <meshPhysicalMaterial
              color={SCREEN}
              roughness={0.16}
              metalness={0.4}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
              envMapIntensity={0.45}
            />
          </RoundedBox>

          {/* face glow strip */}
          <mesh position={[0, -0.3, 0.655]}>
            <planeGeometry args={[0.55, 0.05]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.35} toneMapped={false} />
          </mesh>

          {/* eyes */}
          <group ref={blinkGroup} position={[0, 0.09, 0.665]}>
            <Eye position={[-0.27, 0, 0]} side={1} />
            <Eye position={[0.27, 0, 0]} side={-1} />
          </group>

          {/* smile */}
          <mesh position={[0, -0.165, 0.655]} rotation={[0, 0, Math.PI]} ref={smileRef}>
            <torusGeometry args={[0.1, 0.022, 10, 32, Math.PI]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#c084fc"
              emissiveIntensity={2.4}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>

          {/* cheeks */}
          <mesh position={[-0.44, -0.16, 0.6]} ref={cheekLeft}>
            <circleGeometry args={[0.075, 22]} />
            <meshBasicMaterial color="#f472b6" transparent opacity={0.4} toneMapped={false} />
          </mesh>
          <mesh position={[0.44, -0.16, 0.6]} ref={cheekRight}>
            <circleGeometry args={[0.075, 22]} />
            <meshBasicMaterial color="#f472b6" transparent opacity={0.4} toneMapped={false} />
          </mesh>

          {/* ears */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.745, -0.02, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.205, 0.205, 0.16, 30]} />
                <meshPhysicalMaterial
                  color={PURPLE}
                  roughness={0.24}
                  metalness={0.5}
                  clearcoat={1}
                />
              </mesh>
              <mesh position={[0, 0, side * 0.085]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.115, 0.115, 0.04, 26]} />
                <meshStandardMaterial
                  color={LAVENDER}
                  emissive={PURPLE}
                  emissiveIntensity={1.1}
                  roughness={0.3}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}

          {/* antenna */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.021, 0.032, 0.34, 16]} />
            <meshPhysicalMaterial
              color={LAVENDER}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[0, 0.88, 0]} ref={antennaGlow}>
            <sphereGeometry args={[0.078, 24, 24]} />
            <meshStandardMaterial
              color="#c084fc"
              emissive="#a855f7"
              emissiveIntensity={2.6}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            ref={antennaLight}
            position={[0, 0.88, 0]}
            color="#a855f7"
            intensity={0.6}
            distance={1.8}
          />
        </group>

        {/* ============ TORSO ============ */}
        <group ref={torso}>
          {/* neck */}
          <mesh position={[0, 0.53, 0]}>
            <cylinderGeometry args={[0.24, 0.29, 0.2, 26]} />
            <meshPhysicalMaterial
              color={DARK}
              roughness={0.32}
              metalness={0.6}
            />
          </mesh>
          <mesh position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.245, 0.026, 10, 30]} />
            <meshStandardMaterial
              color={LAVENDER}
              emissive={PURPLE}
              emissiveIntensity={0.9}
              toneMapped={false}
            />
          </mesh>

          {/* body */}
          <RoundedBox
            args={[1.12, 1.02, 0.76]}
            radius={0.33}
            smoothness={9}
            position={[0, -0.06, 0]}
          >
            <meshPhysicalMaterial
              color={PEARL}
              roughness={0.13}
              metalness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.09}
              envMapIntensity={1.3}
            />
          </RoundedBox>

          {/* chest ring */}
          <mesh position={[0, -0.02, 0.36]}>
            <torusGeometry args={[0.195, 0.048, 16, 44]} />
            <meshPhysicalMaterial
              color={PURPLE}
              roughness={0.22}
              metalness={0.55}
              emissive={VIOLET}
              emissiveIntensity={0.7}
              clearcoat={1}
            />
          </mesh>

          {/* chest core */}
          <mesh position={[0, -0.02, 0.365]} ref={chestGlow}>
            <circleGeometry args={[0.175, 40]} />
            <meshStandardMaterial
              color="#1b1040"
              emissive="#7c3aed"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, -0.02, 0.376]}>
            <ringGeometry args={[0.1, 0.13, 32, 1, 0, Math.PI * 1.3]} />
            <meshBasicMaterial color="#a5f3fc" transparent opacity={0.9} toneMapped={false} />
          </mesh>

          {/* belly seam */}
          <mesh position={[0, -0.4, 0.33]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.42, 0.03]} />
            <meshStandardMaterial
              color={LAVENDER}
              emissive={PURPLE}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>

          {/* shoulder pads */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.63, 0.36, 0]}>
              <sphereGeometry args={[0.2, 26, 26]} />
              <meshPhysicalMaterial
                color={PEARL}
                roughness={0.14}
                metalness={0.08}
                clearcoat={1}
                envMapIntensity={1.2}
              />
            </mesh>
          ))}
        </group>

        {/* ============ LIMBS ============ */}
        <Arm side={1} armRef={rightArm} />
        <Arm side={-1} armRef={leftArm} />
        <Leg side={1} />
        <Leg side={-1} />
      </group>

      {/* soft grounded shadow */}
      <ContactShadows
        position={[0, -1.32, 0]}
        opacity={0.42}
        scale={5.5}
        blur={2.9}
        far={2.4}
        resolution={256}
        color="#241a4d"
      />
    </>
  );
}
