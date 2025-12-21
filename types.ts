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
  showParticles: boolean;
  gradientType: GradientType;
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
