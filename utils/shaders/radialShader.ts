import { COMMON_UNIFORMS_AND_UTILS } from "./common";

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
