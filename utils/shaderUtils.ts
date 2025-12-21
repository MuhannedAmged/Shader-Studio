import { GradientType } from "../types";

export const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const COMMON_UNIFORMS_AND_UTILS = `
varying vec2 vUv;
#define PI 3.14159265359
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uSpeed;
uniform float uDensity;
uniform float uStrength;
uniform float uHue;
uniform float uSaturation;
uniform float uBrightness;

// Noise Parameters
uniform float uNoiseScale;
uniform int uNoiseOctaves;
uniform float uNoisePersistence;

// New Parameters
uniform float uDistortion;
uniform float uWarp;
uniform float uGrain;
uniform float uPixelation;
uniform float uContrast;
uniform float uExposure;
uniform float uSharpness;
uniform float uVignette;
uniform float uChromaticAberration;
uniform float uGlow;
uniform float uBloomThreshold;
uniform float uQuantization;
uniform float uScanlines;
uniform float uRotation;
uniform float uZoom;
uniform float uTimeOffset;
uniform sampler2D tDiffuse;

vec2 transformUV(vec2 uv) {
    vec2 centered = uv - 0.5;
    float s = sin(uRotation);
    float c = cos(uRotation);
    mat2 rot = mat2(c, -s, s, c);
    centered = rot * centered;
    centered /= uZoom;
    return centered + 0.5;
}

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
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

// Fractal Brownian Motion
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < 8; i++) {
        if (i >= uNoiseOctaves) break;
        value += amplitude * snoise(st);
        st *= 2.0;
        amplitude *= uNoisePersistence;
    }
    return value;
}

// Hue rotation helper
vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

vec3 applyCorrections(vec3 color) {
    // 1. Exposure
    color *= pow(2.0, uExposure);

    // 2. Hue
    if (uHue != 0.0) {
        color = hueShift(color, uHue);
    }
    
    // 3. Saturation
    if (uSaturation != 1.0) {
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
        vec3 gray = vec3(luminance);
        color = mix(gray, color, uSaturation);
    }
    
    // 4. Brightness
    if (uBrightness != 1.0) {
        color = color * uBrightness;
    }

    // 5. Contrast
    color = (color - 0.5) * uContrast + 0.5;

    return clamp(color, 0.0, 1.0);
}

vec3 applyPostEffects(vec3 color, vec2 uv) {
    // 1. Chromatic Aberration
    if (uChromaticAberration > 0.0) {
        float amount = uChromaticAberration * 0.02;
        float r = texture2D(tDiffuse, uv + vec2(amount, 0.0)).r;
        float g = color.g;
        float b = texture2D(tDiffuse, uv - vec2(amount, 0.0)).b;
        color = vec3(r, g, b);
    }

    // 2. Grain
    if (uGrain > 0.0) {
        float noise = (fract(sin(dot(uv, vec2(12.9898,78.233)*uTime)) * 43758.5453));
        color = mix(color, color + (noise - 0.5) * 0.2, uGrain);
    }
    
    // 3. Vignette
    if (uVignette > 0.0) {
        float d = length(uv - 0.5);
        color *= smoothstep(0.8, 0.2 * (1.0 - uVignette), d);
    }

    // 4. Glow (Refined with Bloom Threshold)
    if (uGlow > 0.0) {
        float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
        if (brightness > uBloomThreshold) {
            color += color * uGlow * 0.5;
        }
    }

    // 5. Color Quantization (Retro look)
    if (uQuantization > 0.0) {
        float levels = mix(256.0, 2.0, uQuantization);
        color = floor(color * levels) / levels;
    }

    // 6. Scanlines
    if (uScanlines > 0.0) {
        float scanline = sin(uv.y * 800.0) * 0.04 * uScanlines;
        color -= scanline;
    }
    
    return color;
}
`;

export const NOISE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
  vec2 uv = transformUV(vUv);
  if (uPixelation > 0.0) {
    float pixels = 200.0 * (1.1 - uPixelation);
    uv = floor(uv * pixels) / pixels;
  }
  float time = (uTime + uTimeOffset) * uSpeed;
  vec2 pos = uv * uDensity;
  
  float pattern = fbm(pos * uNoiseScale + vec2(time * 0.1));
  float pattern2 = fbm(pos * uNoiseScale * 1.5 - vec2(time * 0.2));
  
  float finalPattern = (pattern + pattern2) * uStrength;
  
  vec3 color = mix(uColor1, uColor2, uv.x + finalPattern);
  color = mix(color, uColor3, uv.y - finalPattern);
  
  color = applyCorrections(color);
  gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const FRACTAL_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float domainWarp(vec2 p) {
    float time = uTime * uSpeed * 0.5;
    vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + time * 0.1),
        fbm(p + vec2(5.2, 1.3) + time * 0.2)
    );
    vec2 r = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2) + time * 0.3),
        fbm(p + 4.0 * q + vec2(8.3, 2.8) - time * 0.3)
    );
    return fbm(p + 4.0 * r);
}

void main() {
  vec2 uv = transformUV(vUv);
  if (uPixelation > 0.0) {
    float pixels = 200.0 * (1.1 - uPixelation);
    uv = floor(uv * pixels) / pixels;
  }
  vec2 pos = uv * uDensity * 0.5; // Scale down a bit for fractal
  
  float pattern = domainWarp(pos * uNoiseScale);
  float mixVal = smoothstep(0.0, 1.0, pattern * uStrength + 0.5);
  
  vec3 color = mix(uColor1, uColor2, mixVal);
  color = mix(color, uColor3, uv.y * 0.5 + pattern * 0.5);
  
  color = applyCorrections(color);
  gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const LINEAR_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
  vec2 uv = transformUV(vUv);
  if (uPixelation > 0.0) {
    float pixels = 200.0 * (1.1 - uPixelation);
    uv = floor(uv * pixels) / pixels;
  }
  float time = (uTime + uTimeOffset) * uSpeed * 0.5;
  
  // Rotate UV (Existing logic, but we'll use transformUV as base)
  float s = sin(time * 0.1 + uDensity);
  float c = cos(time * 0.1 + uDensity);
  mat2 rot = mat2(c, -s, s, c);
  vec2 rotUv = rot * (uv - 0.5) + 0.5;
  
  float t = rotUv.x + rotUv.y * 0.5;
  t += sin(uv.x * 10.0 * uStrength + time) * 0.05;
  
  vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.6, t));
  color = mix(color, uColor3, smoothstep(0.4, 1.0, t));
  
  color = applyCorrections(color);
  gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const RADIAL_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
  vec2 uv = transformUV(vUv);
  if (uPixelation > 0.0) {
    float pixels = 200.0 * (1.1 - uPixelation);
    uv = floor(uv * pixels) / pixels;
  }
  vec2 center = vec2(0.5, 0.5);
  float time = (uTime + uTimeOffset) * uSpeed;
  
  // Moving center
  center += vec2(sin(time * 0.5), cos(time * 0.3)) * 0.1 * uDensity;
  
  float dist = length(uv - center) * uDensity;
  
  // Ripple
  dist += sin(dist * 10.0 - time) * 0.05 * uStrength;
  
  vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, dist));
  color = mix(color, uColor3, smoothstep(0.4, 1.2, dist));
  
  color = applyCorrections(color);
  gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const MESH_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(time * 0.7), 0.5 + 0.3 * cos(time * 0.8));
    vec2 p2 = vec2(0.5 + 0.3 * sin(time * 0.9 + 2.0), 0.5 + 0.3 * cos(time * 0.6 + 1.0));
    vec2 p3 = vec2(0.5 + 0.3 * sin(time * 0.5 + 4.0), 0.5 + 0.3 * cos(time * 1.1 + 3.0));
    
    float d1 = 1.0 / (length(uv - p1) * uDensity + 0.1);
    float d2 = 1.0 / (length(uv - p2) * uDensity + 0.1);
    float d3 = 1.0 / (length(uv - p3) * uDensity + 0.1);
    
    float sum = d1 + d2 + d3;
    vec3 color = (uColor1 * d1 + uColor2 * d2 + uColor3 * d3) / sum;
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const AURORA_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 pos = uv * uDensity;
    pos.y += fbm(pos + time * 0.2) * uDistortion;
    
    float n = fbm(pos * uNoiseScale + time * 0.1);
    float band = smoothstep(0.4, 0.5, n) * smoothstep(0.6, 0.5, n);
    
    vec3 color = mix(uColor1, uColor2, uv.y);
    color = mix(color, uColor3, band * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const LIQUID_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 warp = uv;
    warp.x += sin(uv.y * 10.0 + time) * 0.05 * uWarp;
    warp.y += cos(uv.x * 10.0 + time) * 0.05 * uWarp;
    
    float n = fbm(warp * uDensity * uNoiseScale);
    vec3 color = mix(uColor1, uColor2, n * uStrength);
    color = mix(color, uColor3, length(uv - 0.5));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const WAVE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    float wave = sin(uv.x * uDensity * 5.0 + time) * 0.1 * uStrength;
    wave += sin(uv.y * uDensity * 3.0 - time * 0.5) * 0.05 * uStrength;
    
    vec3 color = mix(uColor1, uColor2, uv.y + wave);
    color = mix(color, uColor3, uv.x - wave);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const COSINE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

vec3 palette(float t) {
    return uColor1 + uColor2 * cos(6.28318 * (uColor3 * t + vec3(0.0, 0.33, 0.67) * uStrength));
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity;
    
    float d = length(p);
    d = sin(d * 8.0 + time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2 * (1.0 + uSharpness));
    
    vec3 color = palette(length(p) + time);
    color *= d;
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const CONIC_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv - 0.5;
    
    float angle = atan(p.y, p.x) / 6.28318 + 0.5;
    angle = fract(angle * uDensity + time * 0.1);
    
    float noise = fbm(uv * uNoiseScale + time * 0.1) * uStrength;
    angle = fract(angle + noise);
    
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, angle));
    color = mix(color, uColor3, smoothstep(0.5, 1.0, angle));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const STRIPES_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    float pattern = sin(uv.x * uDensity * 10.0 + time + fbm(uv * uNoiseScale) * uDistortion);
    pattern = smoothstep(-0.1, 0.1, pattern / (0.1 + uSharpness * 0.5));
    
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, uv.y * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const PLASMA_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 5.0;
    
    float v = sin(p.x + time);
    v += sin((p.y + time) / 2.0);
    v += sin((p.x + p.y + time) / 2.0);
    p += vec2(sin(time / 3.0), cos(time / 2.0));
    v += sin(sqrt(p.x*p.x + p.y*p.y + 1.0) + time);
    v = v / 2.0;
    
    vec3 color = vec3(sin(v * PI), sin(v * PI + 2.0 * PI / 3.0), sin(v * PI + 4.0 * PI / 3.0));
    color = mix(uColor1, color, uStrength);
    color = mix(color, uColor2, sin(v * PI));
    color = mix(color, uColor3, cos(v * PI));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const VORONOI_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 n = floor(p);
    vec2 f = fract(p);
    
    float m_dist = 1.0;
    for (int j=-1; j<=1; j++) {
        for (int i=-1; i<=1; i++) {
            vec2 g = vec2(float(i),float(j));
            vec2 o = hash2(n + g);
            o = 0.5 + 0.5*sin(time + 6.2831*o);
            vec2 r = g + o - f;
            float d = dot(r,r);
            m_dist = min(m_dist, d);
        }
    }
    
    float pattern = 1.0 - smoothstep(0.0, 0.1 + uSharpness, m_dist * uStrength);
    vec3 color = mix(uColor1, uColor2, m_dist);
    color = mix(color, uColor3, pattern);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const METABALLS_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 2.0;
    
    float m = 0.0;
    for(int i=0; i<5; i++) {
        float fi = float(i);
        vec2 pos = vec2(sin(time * 0.5 + fi * 1.2), cos(time * 0.7 + fi * 0.8)) * 0.5;
        m += 0.1 / length(p - pos);
    }
    
    float pattern = smoothstep(0.4, 0.4 + 0.1 / (1.0 + uSharpness), m * uStrength);
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, m * 0.2);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const KALEIDOSCOPE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv - 0.5;
    
    float r = length(p);
    float a = atan(p.y, p.x);
    
    float sides = 6.0 + floor(uDensity);
    a = mod(a, 2.0 * PI / sides);
    a = abs(a - PI / sides);
    
    p = r * vec2(cos(a), sin(a));
    p += time * 0.1;
    
    float n = fbm(p * uNoiseScale);
    vec3 color = mix(uColor1, uColor2, n * uStrength);
    color = mix(color, uColor3, r);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const SPIRAL_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv - 0.5;
    
    float r = length(p) * uDensity;
    float a = atan(p.y, p.x);
    
    float spiral = sin(r * 10.0 - a * 3.0 + time);
    spiral = smoothstep(-0.1, 0.1, spiral / (0.1 + uSharpness));
    
    vec3 color = mix(uColor1, uColor2, spiral);
    color = mix(color, uColor3, r * 0.5);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const GRID_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 grid = abs(fract(p - 0.5) - 0.5) / (0.1 + uSharpness * 0.1);
    float line = min(grid.x, grid.y);
    line = 1.0 - smoothstep(0.0, 0.1, line);
    
    float noise = fbm(uv * uNoiseScale + time * 0.1);
    vec3 color = mix(uColor1, uColor2, noise);
    color = mix(color, uColor3, line * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const CAUSTICS_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = vUv;
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = uTime * uSpeed;
    vec2 p = uv * uDensity;
    
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;

    for (int n = 0; n < 5; n++) {
        float t = time * (1.0 - (3.5 / float(n+1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x+t)/inten), p.y / (cos(i.y+t)/inten)));
    }
    
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    vec3 color = vec3(pow(abs(c), 8.0));
    color = clamp(color + uColor1, 0.0, 1.0);
    
    color = mix(color, uColor2, uStrength * 0.5);
    color = mix(color, uColor3, length(uv - 0.5));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const STARFIELD_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float star(vec2 uv, float flare) {
    float d = length(uv);
    float m = 0.05 / d;
    float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
    m += rays * flare;
    m *= smoothstep(0.5, 0.2, d);
    return m;
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 5.0;
    
    vec3 color = vec3(0.0);
    for(float i=0.0; i<1.0; i+=1.0/4.0) {
        float depth = fract(i + time * 0.1);
        float scale = mix(20.0, 0.5, depth);
        float fade = depth * smoothstep(1.0, 0.9, depth);
        vec2 gv = fract(p * scale) - 0.5;
        vec2 id = floor(p * scale);
        vec2 r = fract(sin(id * 123.45) * 678.9) - 0.5;
        float s = star(gv - r, smoothstep(0.9, 1.0, depth));
        vec3 starColor = mix(uColor1, uColor2, fract(sin(id.x * 45.6) * 78.9));
        color += s * fade * starColor;
    }
    
    color = mix(color, uColor3, length(uv - 0.5) * 0.2);
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const FLOW_FIELD_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity;
    
    for(int i=0; i<3; i++) {
        float n = fbm(p + time * 0.1);
        p += vec2(cos(n * PI * 2.0), sin(n * PI * 2.0)) * 0.1 * uStrength;
    }
    
    float pattern = fbm(p * uNoiseScale);
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, smoothstep(0.3, 0.7, pattern));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const RAYMARCHING_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float map(vec3 p) {
    float time = uTime * uSpeed;
    vec3 q = mod(p + 2.0, 4.0) - 2.0;
    float s1 = sdSphere(q, 1.0 + sin(time + p.x) * 0.2 * uStrength);
    return s1;
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    vec2 p = (uv - 0.5) * 2.0;
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec3 ro = vec3(0.0, 0.0, -5.0 + time);
    vec3 rd = normalize(vec3(p, 1.0));
    
    float t = 0.0;
    for(int i=0; i<32; i++) {
        vec3 pos = ro + rd * t;
        float h = map(pos);
        if(h < 0.001 || t > 20.0) break;
        t += h;
    }
    
    vec3 color = uColor1;
    if(t < 20.0) {
        vec3 pos = ro + rd * t;
        vec2 eps = vec2(0.001, 0.0);
        vec3 nor = normalize(vec3(
            map(pos+eps.xyy) - map(pos-eps.xyy),
            map(pos+eps.yxy) - map(pos-eps.yxy),
            map(pos+eps.yyx) - map(pos-eps.yyx)
        ));
        float diff = max(0.0, dot(nor, normalize(vec3(1,2,-3))));
        color = mix(uColor2, uColor3, diff);
    }
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const HALFTONE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 10.0;
    
    float n = fbm(uv * uNoiseScale + time * 0.1);
    float gray = mix(0.0, 1.0, n);
    
    vec2 gv = fract(p) - 0.5;
    float d = length(gv);
    float mask = smoothstep(gray * 0.5, gray * 0.5 - 0.1 / (1.0 + uSharpness), d);
    
    vec3 color = mix(uColor1, uColor2, n);
    color = mix(color, uColor3, mask * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const TRUCHET_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float hash12(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 gv = fract(p) - 0.5;
    vec2 id = floor(p);
    
    float n = hash12(id);
    if(n < 0.5) gv.x *= -1.0;
    
    float d = abs(abs(gv.x + gv.y) - 0.5);
    float mask = smoothstep(0.1 + uSharpness * 0.1, 0.0, d);
    
    vec3 color = mix(uColor1, uColor2, fbm(uv * uNoiseScale + time * 0.1));
    color = mix(color, uColor3, mask * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;

export const getFragmentShader = (type: GradientType): string => {
  switch (type) {
    case GradientType.NOISE:
      return NOISE_FRAGMENT_SHADER;
    case GradientType.FRACTAL:
      return FRACTAL_FRAGMENT_SHADER;
    case GradientType.LINEAR:
      return LINEAR_FRAGMENT_SHADER;
    case GradientType.RADIAL:
      return RADIAL_FRAGMENT_SHADER;
    case GradientType.MESH:
      return MESH_FRAGMENT_SHADER;
    case GradientType.AURORA:
      return AURORA_FRAGMENT_SHADER;
    case GradientType.LIQUID:
      return LIQUID_FRAGMENT_SHADER;
    case GradientType.WAVE:
      return WAVE_FRAGMENT_SHADER;
    case GradientType.COSINE:
      return COSINE_FRAGMENT_SHADER;
    case GradientType.CONIC:
      return CONIC_FRAGMENT_SHADER;
    case GradientType.STRIPES:
      return STRIPES_FRAGMENT_SHADER;
    case GradientType.PLASMA:
      return PLASMA_FRAGMENT_SHADER;
    case GradientType.VORONOI:
      return VORONOI_FRAGMENT_SHADER;
    case GradientType.METABALLS:
      return METABALLS_FRAGMENT_SHADER;
    case GradientType.KALEIDOSCOPE:
      return KALEIDOSCOPE_FRAGMENT_SHADER;
    case GradientType.SPIRAL:
      return SPIRAL_FRAGMENT_SHADER;
    case GradientType.GRID:
      return GRID_FRAGMENT_SHADER;
    case GradientType.CAUSTICS:
      return CAUSTICS_FRAGMENT_SHADER;
    case GradientType.STARFIELD:
      return STARFIELD_FRAGMENT_SHADER;
    case GradientType.FLOW_FIELD:
      return FLOW_FIELD_FRAGMENT_SHADER;
    case GradientType.RAYMARCHING:
      return RAYMARCHING_FRAGMENT_SHADER;
    case GradientType.HALFTONE:
      return HALFTONE_FRAGMENT_SHADER;
    case GradientType.TRUCHET:
      return TRUCHET_FRAGMENT_SHADER;
    default:
      return NOISE_FRAGMENT_SHADER;
  }
};

export const DEFAULT_FRAGMENT_SHADER = NOISE_FRAGMENT_SHADER;

export const BLUR_FRAGMENT_SHADER = `
uniform sampler2D tDiffuse;
uniform float uBlurStrength;
varying vec2 vUv;

void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;
    
    // Simple 9-tap gaussian-ish sampling
    // Offset scaled by strength
    float offset = uBlurStrength * 0.003; 
    
    for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
            vec2 d = vec2(x, y);
            float dist = length(d);
            float weight = exp(-(dist * dist) / 2.0); // Gaussian weight
            
            color += texture2D(tDiffuse, vUv + d * offset) * weight;
            total += weight;
        }
    }
    
    gl_FragColor = color / total;
}
`;

export const FOG_FRAGMENT_SHADER = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uSpeed;

// Simplex 2D noise
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
  m = m*m ;
  m = m*m ;
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

void main() {
    float t = uTime * uSpeed * 0.2;
    vec2 uv = vUv;
    
    // Generate organic flow
    float n1 = snoise(uv * 2.0 + vec2(t, t * 0.4));
    float n2 = snoise(uv * 4.0 - vec2(t * 0.4, t));
    
    float fog = (n1 + n2) * 0.5;
    fog = smoothstep(-0.2, 0.8, fog); // increase contrast
    
    // Color influence
    vec3 baseColor = mix(uColor1, uColor3, 0.5);
    vec3 glowColor = mix(uColor2, vec3(1.0), 0.2);
    
    vec3 finalColor = mix(baseColor, glowColor, fog);
    
    // Vignette for depth
    float d = length(uv - 0.5);
    float alpha = fog * 0.15 * (1.0 - d * 0.5);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

export const PARTICLE_VERTEX_SHADER = `
uniform float uTime;
uniform float uSpeed;
uniform float uDensity;
uniform float uStrength;
uniform float uNoiseScale;
uniform int uNoiseOctaves;
uniform float uNoisePersistence;
uniform float uParticleSize;
uniform float uParticleSpeed;

attribute float aSize;
attribute float aRandom;

varying vec3 vColor;
varying float vAlpha;

// NOISE FUNCTIONS (Duplicated for vertex accessibility)
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
  m = m*m ;
  m = m*m ;
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
    for (int i = 0; i < 8; i++) {
        if (i >= uNoiseOctaves) break;
        value += amplitude * snoise(st);
        st *= 2.0;
        amplitude *= uNoisePersistence;
    }
    return value;
}

void main() {
  vec3 pos = position;
  float t = uTime * uSpeed * uParticleSpeed;
  
  // Continuous Flow: Particles move upward and wiggle
  pos.y += t * 0.5 + aRandom * 10.0;
  pos.x += sin(t * 0.5 + aRandom * 20.0) * 0.5;
  
  // Box Wrapping: Keep particles within a virtual box
  float boxSize = 10.0;
  pos.y = mod(pos.y + boxSize * 0.5, boxSize) - boxSize * 0.5;
  pos.x = mod(pos.x + boxSize * 0.5, boxSize) - boxSize * 0.5;
  
  // Noise Displacement: Match background feel
  // We use xy coordinates scaled by density to sample noise
  float noiseVal = fbm(pos.xy * uDensity * uNoiseScale * 0.5 + t * 0.1);
  
  // Displace Z based on noise and strength
  pos.z += noiseVal * uStrength * 2.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Size Attenuation: Particles further away are smaller
  // Modulated by noise for "twinkle" effect
  gl_PointSize = aSize * uParticleSize * (1.0 + noiseVal * 0.5) * (15.0 / -mvPosition.z);
  
  vAlpha = 0.3 + 0.7 * smoothstep(-1.0, 1.0, noiseVal);
}
`;

export const PARTICLE_FRAGMENT_SHADER = `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uParticleOpacity;

varying float vAlpha;

void main() {
  // Circular soft particle
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.0, dist);
  
  // Color mixing based on radius (center is hotter/different color)
  vec3 color = mix(uColor1, uColor2, vAlpha);
  color = mix(color, uColor3, dist * 2.0); // Highlight centers
  
  gl_FragColor = vec4(color, alpha * vAlpha * uParticleOpacity);
}
`;

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
