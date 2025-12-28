export const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

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
