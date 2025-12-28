import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const STRIPES_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    float pattern = sin(uv.x * uDensity * 10.0 + time + fbm(uv * uNoiseScale) * uDistortion);
    pattern = smoothstep(-0.1, 0.1, pattern / (0.1 + uSharpness * 0.5));
    
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, uv.y * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
