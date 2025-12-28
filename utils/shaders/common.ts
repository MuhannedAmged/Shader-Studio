export const COMMON_UNIFORMS_AND_UTILS = `
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
uniform float uGamma;
uniform float uEmboss;
uniform float uBloomIntensity;
uniform float uBloomRadius;
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
    
    for (int i = 0; i < 5; i++) {
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
        vec3 splitColor = color;
        // Simplified for standalone; in full app we have tDiffuse
        splitColor.r = texture2D(tDiffuse, uv + vec2(amount, 0.0)).r;
        splitColor.b = texture2D(tDiffuse, uv - vec2(amount, 0.0)).b;
        color = mix(color, splitColor, 1.0);
    }

    // 2. Grain
    if (uGrain > 0.0) {
        float noise = (fract(sin(dot(uv, vec2(12.9898,78.233)*(uTime + uTimeOffset))) * 43758.5453));
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

    // 5. Color Quantization
    if (uQuantization > 0.0) {
        float levels = mix(256.0, 2.0, uQuantization);
        color = floor(color * levels) / levels;
    }

    // 6. Scanlines
    if (uScanlines > 0.0) {
        float scanline = sin(uv.y * 800.0) * 0.04 * uScanlines;
        color -= scanline;
    }
    
    // 7. Emboss
    if (uEmboss > 0.0) {
        vec2 offset = vec2(0.002, 0.002);
        vec3 colTL = texture2D(tDiffuse, uv - offset).rgb;
        vec3 colBR = texture2D(tDiffuse, uv + offset).rgb;
        float diff = dot(colTL - colBR, vec3(0.299, 0.587, 0.114));
        color += diff * uEmboss * 2.0;
    }

    // 8. Gamma
    if (uGamma > 0.0 && uGamma != 1.0) {
        color = pow(color, vec3(1.0 / uGamma));
    }
    
    return color;
}
`;
