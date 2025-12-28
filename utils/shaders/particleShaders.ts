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
uniform int uParticleType; // 0: STAR, 1: SNOW, 2: BUBBLES, 3: RAIN, 4: FIREFLIES

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
    for (int i = 0; i < 5; i++) {
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
  
  if (uParticleType == 0) { // STAR
      pos.y += t * 0.2 + aRandom * 10.0;
      pos.x += sin(t * 0.1 + aRandom * 20.0) * 0.2;
  } else if (uParticleType == 1) { // SNOW
      pos.y -= t * 0.5 + aRandom * 5.0;
      pos.x += sin(t * 0.5 + aRandom * 10.0) * 0.3;
  } else if (uParticleType == 2) { // BUBBLES
      pos.y += t * 0.8 + aRandom * 5.0;
      pos.x += cos(t * 0.4 + aRandom * 15.0) * 0.4;
  } else if (uParticleType == 3) { // RAIN
      pos.y -= t * 2.0 + aRandom * 2.0;
      pos.x += (aRandom - 0.5) * 0.1;
  } else if (uParticleType == 4) { // FIREFLIES
      pos.x += sin(t * 0.5 + aRandom * 20.0) * 2.0;
      pos.y += cos(t * 0.4 + aRandom * 15.0) * 2.0;
  }
  
  // Box Wrapping
  float boxSize = 10.0;
  pos.y = mod(pos.y + boxSize * 0.5, boxSize) - boxSize * 0.5;
  pos.x = mod(pos.x + boxSize * 0.5, boxSize) - boxSize * 0.5;
  
  float noiseVal = fbm(pos.xy * uDensity * uNoiseScale * 0.5 + t * 0.1);
  pos.z += noiseVal * uStrength * 2.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  gl_PointSize = aSize * uParticleSize * (1.0 + noiseVal * 0.5) * (15.0 / -mvPosition.z);
  
  if (uParticleType == 3) gl_PointSize *= 0.5; // Thinner rain
  
  vAlpha = 0.3 + 0.7 * smoothstep(-1.0, 1.0, noiseVal);
}
`;

export const PARTICLE_FRAGMENT_SHADER = `
uniform vec3 uParticleColor1;
uniform vec3 uParticleColor2;
uniform float uParticleOpacity;

varying float vAlpha;

void main() {
  // Circular soft particle
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.0, dist);
  
  // Color mixing based on radius (center is hotter/different color)
  vec3 color = mix(uParticleColor1, uParticleColor2, vAlpha);
  color = mix(color, vec3(1.0), smoothstep(0.2, 0.0, dist)); // Highlight centers
  
  gl_FragColor = vec4(color, alpha * vAlpha * uParticleOpacity);
}
`;
