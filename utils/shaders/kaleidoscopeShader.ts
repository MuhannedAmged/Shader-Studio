import { COMMON_UNIFORMS_AND_UTILS } from "./common";

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
