import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, createPortal, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ShaderConfig } from "../types";
import {
  DEFAULT_VERTEX_SHADER,
  PARTICLE_VERTEX_SHADER,
  PARTICLE_FRAGMENT_SHADER,
  BLUR_FRAGMENT_SHADER,
  FOG_FRAGMENT_SHADER,
  hexToRgb,
} from "../utils/shaderUtils";

// Bypass TypeScript intrinsic element checks for R3F primitives by aliasing them
const Mesh = "mesh" as any;
const PlaneGeometry = "planeGeometry" as any;
const ShaderMaterial = "shaderMaterial" as any;
const Points = "points" as any;

interface ShaderMeshProps {
  config: ShaderConfig;
  isPaused: boolean;
  resetTimeSignal: number;
  manualTime?: number;
}

const ShaderMesh: React.FC<ShaderMeshProps> = ({
  config,
  isPaused,
  resetTimeSignal,
  manualTime,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef<number>(0);
  const lastResetRef = useRef<number>(resetTimeSignal);

  // Check for reset signal
  if (resetTimeSignal !== lastResetRef.current) {
    timeRef.current = 0;
    lastResetRef.current = resetTimeSignal;
  }

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(...hexToRgb(config.colors[0])) },
      uColor2: { value: new THREE.Color(...hexToRgb(config.colors[1])) },
      uColor3: { value: new THREE.Color(...hexToRgb(config.colors[2])) },
      uSpeed: { value: config.speed },
      uDensity: { value: config.density },
      uStrength: { value: config.strength },
      uHue: { value: config.hue },
      uSaturation: { value: config.saturation },
      uBrightness: { value: config.brightness },
      // Noise params
      uNoiseScale: { value: config.noiseScale },
      uNoiseOctaves: { value: config.noiseOctaves },
      uNoisePersistence: { value: config.noisePersistence },
      uDistortion: { value: config.distortion },
      uWarp: { value: config.warp },
      uGrain: { value: config.grain },
      uPixelation: { value: config.pixelation },
      uContrast: { value: config.contrast },
      uExposure: { value: config.exposure },
      uSharpness: { value: config.sharpness },
      uVignette: { value: config.vignette },
      uChromaticAberration: { value: config.chromaticAberration },
      uGlow: { value: config.glow },
      uBloomThreshold: { value: config.bloomThreshold },
      uQuantization: { value: config.quantization },
      uScanlines: { value: config.scanlines },
      uGamma: { value: config.gamma },
      uEmboss: { value: config.emboss },
      uRotation: { value: config.rotation },
      uZoom: { value: config.zoom },
      uTimeOffset: { value: config.timeOffset },
      tDiffuse: { value: null },
    }),
    []
  );

  // Update uniforms when config changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value.set(
        ...hexToRgb(config.colors[0])
      );
      materialRef.current.uniforms.uColor2.value.set(
        ...hexToRgb(config.colors[1])
      );
      materialRef.current.uniforms.uColor3.value.set(
        ...hexToRgb(config.colors[2])
      );
      materialRef.current.uniforms.uSpeed.value = config.speed;
      materialRef.current.uniforms.uDensity.value = config.density;
      materialRef.current.uniforms.uStrength.value = config.strength;
      materialRef.current.uniforms.uHue.value = config.hue;
      materialRef.current.uniforms.uSaturation.value = config.saturation;
      materialRef.current.uniforms.uBrightness.value = config.brightness;

      // Update Noise Uniforms
      materialRef.current.uniforms.uNoiseScale.value = config.noiseScale;
      materialRef.current.uniforms.uNoiseOctaves.value = config.noiseOctaves;
      materialRef.current.uniforms.uNoisePersistence.value =
        config.noisePersistence;
      materialRef.current.uniforms.uDistortion.value = config.distortion;
      materialRef.current.uniforms.uWarp.value = config.warp;
      materialRef.current.uniforms.uGrain.value = config.grain;
      materialRef.current.uniforms.uPixelation.value = config.pixelation;
      materialRef.current.uniforms.uContrast.value = config.contrast;
      materialRef.current.uniforms.uExposure.value = config.exposure;
      materialRef.current.uniforms.uSharpness.value = config.sharpness;
      materialRef.current.uniforms.uVignette.value = config.vignette;
      materialRef.current.uniforms.uChromaticAberration.value =
        config.chromaticAberration;
      materialRef.current.uniforms.uGlow.value = config.glow;
      materialRef.current.uniforms.uBloomThreshold.value =
        config.bloomThreshold;
      materialRef.current.uniforms.uQuantization.value = config.quantization;
      materialRef.current.uniforms.uScanlines.value = config.scanlines;
      materialRef.current.uniforms.uGamma.value = config.gamma;
      materialRef.current.uniforms.uEmboss.value = config.emboss;
      materialRef.current.uniforms.uRotation.value = config.rotation;
      materialRef.current.uniforms.uZoom.value = config.zoom;
      materialRef.current.uniforms.uTimeOffset.value = config.timeOffset;
    }
  }, [config]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      if (manualTime !== undefined) {
        materialRef.current.uniforms.uTime.value = manualTime;
      } else {
        if (!isPaused) {
          timeRef.current += delta;
        }
        materialRef.current.uniforms.uTime.value = timeRef.current;
      }
    }
  });

  return (
    <Mesh ref={meshRef} scale={[20, 20, 1]}>
      <PlaneGeometry args={[2, 2]} />
      <ShaderMaterial
        key={config.fragmentShader}
        ref={materialRef}
        vertexShader={DEFAULT_VERTEX_SHADER}
        fragmentShader={config.fragmentShader}
        uniforms={uniforms}
      />
    </Mesh>
  );
};

// Component to handle background rendering to FBO
const BackgroundRenderer: React.FC<
  ShaderMeshProps & { target: THREE.WebGLRenderTarget }
> = ({ config, isPaused, resetTimeSignal, target }) => {
  const scene = useMemo(() => new THREE.Scene(), []);
  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    []
  );

  // Render the separate scene to the target
  useFrame(({ gl }) => {
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return createPortal(
    <ShaderMesh
      config={config}
      isPaused={isPaused}
      resetTimeSignal={resetTimeSignal}
    />,
    scene
  );
};

// Blur Mesh displays the FBO texture with blur applied
const BlurMesh: React.FC<{ texture: THREE.Texture; blurStrength: number }> = ({
  texture,
  blurStrength,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: texture },
      uBlurStrength: { value: blurStrength },
    }),
    [texture]
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uBlurStrength.value = blurStrength;
    }
  }, [blurStrength]);

  return (
    <Mesh scale={[10, 10, 1]}>
      <PlaneGeometry args={[2, 2]} />
      <ShaderMaterial
        ref={materialRef}
        vertexShader={DEFAULT_VERTEX_SHADER}
        fragmentShader={BLUR_FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </Mesh>
  );
};

// New Volumetric Fog Layer
const FogLayer: React.FC<ShaderMeshProps> = ({
  config,
  isPaused,
  resetTimeSignal,
  manualTime,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef<number>(0);
  const lastResetRef = useRef<number>(resetTimeSignal);

  if (resetTimeSignal !== lastResetRef.current) {
    timeRef.current = 0;
    lastResetRef.current = resetTimeSignal;
  }

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(...hexToRgb(config.colors[0])) },
      uColor2: { value: new THREE.Color(...hexToRgb(config.colors[1])) },
      uColor3: { value: new THREE.Color(...hexToRgb(config.colors[2])) },
      uSpeed: { value: config.speed },
    }),
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value.set(
        ...hexToRgb(config.colors[0])
      );
      materialRef.current.uniforms.uColor2.value.set(
        ...hexToRgb(config.colors[1])
      );
      materialRef.current.uniforms.uColor3.value.set(
        ...hexToRgb(config.colors[2])
      );
      materialRef.current.uniforms.uSpeed.value = config.speed;
    }
  }, [config]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      if (manualTime !== undefined) {
        materialRef.current.uniforms.uTime.value = manualTime;
      } else {
        if (!isPaused) timeRef.current += delta;
        materialRef.current.uniforms.uTime.value = timeRef.current;
      }
    }
  });

  return (
    <Mesh position={[0, 0, 0.05]} scale={[10, 10, 1]}>
      <PlaneGeometry args={[2, 2]} />
      <ShaderMaterial
        ref={materialRef}
        vertexShader={DEFAULT_VERTEX_SHADER}
        fragmentShader={FOG_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </Mesh>
  );
};

const ParticleSystem: React.FC<ShaderMeshProps> = ({
  config,
  isPaused,
  resetTimeSignal,
  manualTime,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef<number>(0);
  const lastResetRef = useRef<number>(resetTimeSignal);

  if (resetTimeSignal !== lastResetRef.current) {
    timeRef.current = 0;
    lastResetRef.current = resetTimeSignal;
  }

  // Generate Geometry once
  const geometry = useMemo(() => {
    const count = config.particleCount;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Create a box volume for particles from -5 to 5
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4; // Flatter depth

      sizes[i] = Math.random() * 2.0 + 1.0; // Random base size
      randoms[i] = Math.random(); // Random offset for animation
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    return geo;
  }, [config.particleCount]);

  // Shared uniforms structure with ShaderMesh
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(...hexToRgb(config.colors[0])) },
      uColor2: { value: new THREE.Color(...hexToRgb(config.colors[1])) },
      uColor3: { value: new THREE.Color(...hexToRgb(config.colors[2])) },
      uSpeed: { value: config.speed },
      uDensity: { value: config.density },
      uStrength: { value: config.strength },
      // Noise
      uNoiseScale: { value: config.noiseScale },
      uNoiseOctaves: { value: config.noiseOctaves },
      uNoisePersistence: { value: config.noisePersistence },
      // Particle specific
      uParticleSize: { value: config.particleSize },
      uParticleSpeed: { value: config.particleSpeed },
      uParticleOpacity: { value: config.particleOpacity },
    }),
    []
  );

  // Sync uniforms effect
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value.set(
        ...hexToRgb(config.colors[0])
      );
      materialRef.current.uniforms.uColor2.value.set(
        ...hexToRgb(config.colors[1])
      );
      materialRef.current.uniforms.uColor3.value.set(
        ...hexToRgb(config.colors[2])
      );
      materialRef.current.uniforms.uSpeed.value = config.speed;
      materialRef.current.uniforms.uDensity.value = config.density;
      materialRef.current.uniforms.uStrength.value = config.strength;
      materialRef.current.uniforms.uNoiseScale.value = config.noiseScale;
      materialRef.current.uniforms.uNoiseOctaves.value = config.noiseOctaves;
      materialRef.current.uniforms.uNoisePersistence.value =
        config.noisePersistence;
      materialRef.current.uniforms.uParticleSize.value = config.particleSize;
      materialRef.current.uniforms.uParticleSpeed.value = config.particleSpeed;
      materialRef.current.uniforms.uParticleOpacity.value =
        config.particleOpacity;
    }
  }, [config]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      if (manualTime !== undefined) {
        materialRef.current.uniforms.uTime.value = manualTime;
      } else {
        if (!isPaused) timeRef.current += delta;
        materialRef.current.uniforms.uTime.value = timeRef.current;
      }
    }
  });

  return (
    <Points ref={pointsRef} geometry={geometry}>
      <ShaderMaterial
        ref={materialRef}
        vertexShader={PARTICLE_VERTEX_SHADER}
        fragmentShader={PARTICLE_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false} // Important for additive blending/particles looking good
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

interface ShaderCanvasProps {
  config: ShaderConfig;
  isPaused: boolean;
  resetTimeSignal: number;
  manualTime?: number;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const SceneContent: React.FC<ShaderCanvasProps> = (props) => {
  const { size, gl } = useThree();

  // Create render target for background
  const target = useMemo(() => {
    return new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType, // High precision
    });
  }, [size.width, size.height]);

  // Resize target on window resize
  useEffect(() => {
    target.setSize(size.width, size.height);
  }, [size, target]);

  // Cleanup
  useEffect(() => {
    return () => target.dispose();
  }, [target]);

  // Notify parent when canvas is ready
  useEffect(() => {
    if (props.onCanvasReady) {
      props.onCanvasReady(gl.domElement);
    }
  }, [gl, props.onCanvasReady]);

  return (
    <>
      <BackgroundRenderer {...props} target={target} />
      <BlurMesh
        texture={target.texture}
        blurStrength={props.config.blurStrength}
      />
      <FogLayer
        config={props.config}
        isPaused={props.isPaused}
        resetTimeSignal={props.resetTimeSignal}
        manualTime={props.manualTime}
      />
      <ShaderMesh
        config={props.config}
        isPaused={props.isPaused}
        resetTimeSignal={props.resetTimeSignal}
        manualTime={props.manualTime}
      />
      {props.config.showParticles && (
        <ParticleSystem
          config={props.config}
          isPaused={props.isPaused}
          resetTimeSignal={props.resetTimeSignal}
          manualTime={props.manualTime}
        />
      )}
    </>
  );
};

const ShaderCanvas: React.FC<ShaderCanvasProps> = (props) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          powerPreference: "high-performance",
          alpha: false,
          antialias: false,
          stencil: false,
          depth: false,
          preserveDrawingBuffer: true,
        }}
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};

export default ShaderCanvas;
