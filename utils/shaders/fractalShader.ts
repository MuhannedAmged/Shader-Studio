import { COMMON_UNIFORMS_AND_UTILS } from "./common";

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
