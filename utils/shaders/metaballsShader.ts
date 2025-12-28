import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const METABALLS_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 2.0;
    
    float m = 0.0;
    for(int i=0; i<5; i++) {
        float fi = float(i);
        vec2 pos = vec2(sin(time * 0.5 + fi * 1.2), cos(time * 0.7 + fi * 0.8)) * 0.5;
        m += 0.1 / length(p - pos);
    }
    
    float pattern = smoothstep(0.4, 0.4 + 0.1 / (1.0 + uSharpness), m * uStrength);
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, m * 0.2);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
