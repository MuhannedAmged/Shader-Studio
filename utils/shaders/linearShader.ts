import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const LINEAR_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
  vec2 uv = transformUV(vUv);
  if (uPixelation > 0.0) {
    float pixels = 200.0 * (1.1 - uPixelation);
    uv = floor(uv * pixels) / pixels;
  }
  float time = (uTime + uTimeOffset) * uSpeed * 0.5;
  
  // Rotate UV
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
