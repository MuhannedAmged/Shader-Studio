import { ShaderConfig } from "../types";

export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
};

export const generateStandaloneShader = (config: ShaderConfig): string => {
  const { colors } = config;
  const c1 = hexToRgb(colors[0]);
  const c2 = hexToRgb(colors[1]);
  const c3 = hexToRgb(colors[2]);

  return `// Shader Studio Export - Standalone GLSL
// High compatibility template for Shadertoy and other editors

#ifdef GL_ES
precision highp float;
#endif

// --- BOILERPLATE & MAPPINGS ---
// Shadertoy built-ins
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform sampler2D iChannel0; // For post-processing effects if needed

#define PI 3.14159265359

// Pre-defined values from the app
const vec3 uColor1 = vec3(${c1[0].toFixed(3)}, ${c1[1].toFixed(
    3
  )}, ${c1[2].toFixed(3)});
const vec3 uColor2 = vec3(${c2[0].toFixed(3)}, ${c2[1].toFixed(
    3
  )}, ${c2[2].toFixed(3)});
const vec3 uColor3 = vec3(${c3[0].toFixed(3)}, ${c3[1].toFixed(
    3
  )}, ${c3[2].toFixed(3)});
const float uSpeed = ${config.speed.toFixed(3)};
const float uDensity = ${config.density.toFixed(3)};
const float uStrength = ${config.strength.toFixed(3)};
const float uHue = ${config.hue.toFixed(3)};
const float uSaturation = ${config.saturation.toFixed(3)};
const float uBrightness = ${config.brightness.toFixed(3)};
const float uNoiseScale = ${config.noiseScale.toFixed(3)};
const int uNoiseOctaves = ${config.noiseOctaves};
const float uNoisePersistence = ${config.noisePersistence.toFixed(3)};
const float uDistortion = ${config.distortion.toFixed(3)};
const float uWarp = ${config.warp.toFixed(3)};
const float uGrain = ${config.grain.toFixed(3)};
const float uPixelation = ${config.pixelation.toFixed(3)};
const float uContrast = ${config.contrast.toFixed(3)};
const float uExposure = ${config.exposure.toFixed(3)};
const float uSharpness = ${config.sharpness.toFixed(3)};
const float uVignette = ${config.vignette.toFixed(3)};
const float uChromaticAberration = ${config.chromaticAberration.toFixed(3)};
const float uGlow = ${config.glow.toFixed(3)};
const float uBloomThreshold = ${config.bloomThreshold.toFixed(3)};
const float uQuantization = ${config.quantization.toFixed(3)};
const float uScanlines = ${config.scanlines.toFixed(3)};
const float uRotation = ${config.rotation.toFixed(3)};
const float uZoom = ${config.zoom.toFixed(3)};
const float uTimeOffset = ${config.timeOffset.toFixed(3)};
const float uGamma = ${config.gamma.toFixed(3)};
const float uEmboss = ${config.emboss.toFixed(3)};

// --- GLOBAL UTILS ---
vec2 transformUV(vec2 uv) {
    vec2 centered = uv - 0.5;
    float s = sin(uRotation);
    float c = cos(uRotation);
    mat2 rot = mat2(c, -s, s, c);
    centered = rot * centered;
    centered /= uZoom;
    return centered + 0.5;
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ; m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
        if (i >= uNoiseOctaves) break;
        value += amplitude * snoise(st);
        st *= 2.0;
        amplitude *= uNoisePersistence;
    }
    return value;
}

vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

vec3 applyCorrections(vec3 color) {
    color *= pow(2.0, uExposure);
    if (uHue != 0.0) color = hueShift(color, uHue);
    if (uSaturation != 1.0) {
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luminance), color, uSaturation);
    }
    color = color * uBrightness;
    color = (color - 0.5) * uContrast + 0.5;
    return clamp(color, 0.0, 1.0);
}

vec3 applyPostEffects(vec3 color, vec2 uv, float time, sampler2D channel0) {
    if (uGrain > 0.0) {
        float noise = (fract(sin(dot(uv, vec2(12.9898,78.233)*(time + uTimeOffset))) * 43758.5453));
        color = mix(color, color + (noise - 0.5) * 0.2, uGrain);
    }
    if (uVignette > 0.0) {
        float d = length(uv - 0.5);
        color *= smoothstep(0.8, 0.2 * (1.0 - uVignette), d);
    }
    if (uGlow > 0.0) {
        float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
        if (brightness > uBloomThreshold) color += color * uGlow * 0.5;
    }
    if (uQuantization > 0.0) {
        float levels = mix(256.0, 2.0, uQuantization);
        color = floor(color * levels) / levels;
    }
    if (uScanlines > 0.0) {
        float scanline = sin(uv.y * 800.0) * 0.04 * uScanlines;
        color -= scanline;
    }
    if (uGamma > 0.0 && uGamma != 1.0) color = pow(color, vec3(1.0 / uGamma));
    return color;
}

// --- SHADER CONTENT ---
${config.fragmentShader
  .replace(
    /void main\(\)/,
    "void mainImage(out vec4 fragColor, in vec2 fragCoord)"
  )
  .replace(/varying vec2 vUv;/, "") // Clean up Three.js headers
  .replace(/uniform[^;]+;/g, "") // Remove manual uniforms (they are baked above)
  .replace(/#include[^>]+>/g, "") // Remove potential includes
  .replace(/vUv/g, "uv") // Standardize UV variable name
  .replace(/uTime/g, "(iTime)") // Map time to Shadertoy
  .replace(/gl_FragColor =/, "fragColor =")
  .replace(/texture2D\(tDiffuse,/, "texture(iChannel0,") // Shadertoy uses texture()
  .replace(
    /void mainImage\(out vec4 fragColor, in vec2 fragCoord\) \{/,
    `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/iResolution.xy;`
  )
  // Fix applyPostEffects signature if it was called with wrong number of args
  .replace(
    /applyPostEffects\(([^,]+),\s*([^\)]+)\)/g,
    "applyPostEffects($1, $2, iTime, iChannel0)"
  )}
  `;
};
