export interface ShaderConfig {
  fragmentShader: string;
  colors: string[];
  speed: number;
  density: number;
  strength: number;
  hue: number;
  saturation: number;
  brightness: number;
  noiseScale: number;
  noiseOctaves: number;
  noisePersistence: number;
  blurStrength: number;
  distortion: number;
  warp: number;
  grain: number;
  pixelation: number;
  contrast: number;
  exposure: number;
  sharpness: number;
  vignette: number;
  chromaticAberration: number;
  glow: number;
  bloomThreshold: number;
  quantization: number;
  scanlines: number;
  gamma: number;
  emboss: number;
  showParticles: boolean;
  particleSize: number;
  particleSpeed: number;
  particleCount: number;
  particleOpacity: number;
  rotation: number;
  zoom: number;
  timeOffset: number;
  gradientType: GradientType;
  particleType: ParticleType;
  particleColor1: string;
  particleColor2: string;
  bloomIntensity: number;
  bloomRadius: number;
}

export enum ParticleType {
  STAR = "STAR",
  SNOW = "SNOW",
  BUBBLES = "BUBBLES",
  RAIN = "RAIN",
  FIREFLIES = "FIREFLIES",
}

export enum GradientType {
  NOISE = "NOISE",
  FRACTAL = "FRACTAL",
  LINEAR = "LINEAR",
  RADIAL = "RADIAL",
  MESH = "MESH",
  AURORA = "AURORA",
  LIQUID = "LIQUID",
  WAVE = "WAVE",
  COSINE = "COSINE",
  CONIC = "CONIC",
  STRIPES = "STRIPES",
  PLASMA = "PLASMA",
  VORONOI = "VORONOI",
  METABALLS = "METABALLS",
  KALEIDOSCOPE = "KALEIDOSCOPE",
  SPIRAL = "SPIRAL",
  GRID = "GRID",
  CAUSTICS = "CAUSTICS",
  STARFIELD = "STARFIELD",
  FLOW_FIELD = "FLOW_FIELD",
  RAYMARCHING = "RAYMARCHING",
  HALFTONE = "HALFTONE",
  TRUCHET = "TRUCHET",
  NEON_CITY = "NEON_CITY",
  CIRCUIT = "CIRCUIT",
  DNA = "DNA",
  MATRIX = "MATRIX",
  GLITCH = "GLITCH",
  CLOUD = "CLOUD",
  GALAXY = "GALAXY",
  OCEAN = "OCEAN",
  FIRE = "FIRE",
}

export interface Preset {
  id: string;
  name: string;
  config: ShaderConfig;
}

export enum GeneratorStatus {
  IDLE = "IDLE",
  GENERATING = "GENERATING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}
