import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const AURORA_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 pos = uv * uDensity;
    pos.y += fbm(pos + time * 0.2) * uDistortion;
    
    float n = fbm(pos * uNoiseScale + time * 0.1);
    float band = smoothstep(0.4, 0.5, n) * smoothstep(0.6, 0.5, n);
    
    vec3 color = mix(uColor1, uColor2, uv.y);
    color = mix(color, uColor3, band * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
