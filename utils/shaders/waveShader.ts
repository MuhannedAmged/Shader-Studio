import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const WAVE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    float wave = sin(uv.x * uDensity * 5.0 + time) * 0.1 * uStrength;
    wave += sin(uv.y * uDensity * 3.0 - time * 0.5) * 0.05 * uStrength;
    
    vec3 color = mix(uColor1, uColor2, uv.y + wave);
    color = mix(color, uColor3, uv.x - wave);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
