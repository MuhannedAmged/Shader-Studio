import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const GALAXY_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 5.0;
    
    float r = length(p);
    float a = atan(p.y, p.x);
    
    // Spiral arms
    float spiral = sin(a * 2.0 - r * 2.0 + time);
    spiral = smoothstep(-0.5, 0.5, spiral);
    
    // Nebula noise
    float n = fbm(p * uNoiseScale + time * 0.1);
    
    vec3 color = mix(uColor1, uColor2, spiral * 0.5 + 0.5);
    color = mix(color, uColor3, n * uStrength);
    
    // Center glow
    color += uColor2 * (0.2 / (r + 0.1));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
