import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const LIQUID_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 warp = uv;
    warp.x += sin(uv.y * 10.0 + time) * 0.05 * uWarp;
    warp.y += cos(uv.x * 10.0 + time) * 0.05 * uWarp;
    
    float n = fbm(warp * uDensity * uNoiseScale);
    vec3 color = mix(uColor1, uColor2, n * uStrength);
    color = mix(color, uColor3, length(uv - 0.5));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
