import { COMMON_UNIFORMS_AND_UTILS } from "./common";

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
