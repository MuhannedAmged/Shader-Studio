import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const HALFTONE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 10.0;
    
    float n = fbm(uv * uNoiseScale + time * 0.1);
    float gray = mix(0.0, 1.0, n);
    
    vec2 gv = fract(p) - 0.5;
    float d = length(gv);
    float mask = smoothstep(gray * 0.5, gray * 0.5 - 0.1 / (1.0 + uSharpness), d);
    
    vec3 color = mix(uColor1, uColor2, n);
    color = mix(color, uColor3, mask * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
