import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const GLITCH_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    // Glitch displacement
    float glitch = step(0.95, sin(time * 10.0 + uv.y * 10.0));
    float shift = (noise(vec2(uv.y * 10.0, time)) - 0.5) * 0.2 * uStrength * glitch;
    
    vec2 p = uv;
    p.x += shift;
    
    // RGB Split
    float split = 0.02 * uDistortion * uStrength;
    float r = fbm(p + vec2(split, 0.0) * uDensity);
    float g = fbm(p);
    float b = fbm(p - vec2(split, 0.0) * uDensity);
    
    // Block noise
    float block = step(0.9, noise(vec2(time * 10.0, uv.y * 5.0))) * uStrength;
    vec3 color = vec3(r, g, b);
    color += block * uColor2;
    
    color = mix(color, uColor1, r);
    color = mix(color, uColor3, b);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
