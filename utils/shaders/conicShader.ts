import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const CONIC_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv - 0.5;
    
    float angle = atan(p.y, p.x) / 6.28318 + 0.5;
    angle = fract(angle * uDensity + time * 0.1);
    
    float noise = fbm(uv * uNoiseScale + time * 0.1) * uStrength;
    angle = fract(angle + noise);
    
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, angle));
    color = mix(color, uColor3, smoothstep(0.5, 1.0, angle));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
