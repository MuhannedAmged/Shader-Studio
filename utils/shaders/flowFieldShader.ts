import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const FLOW_FIELD_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity;
    
    for(int i=0; i<3; i++) {
        float n = fbm(p + time * 0.1);
        p += vec2(cos(n * PI * 2.0), sin(n * PI * 2.0)) * 0.1 * uStrength;
    }
    
    float pattern = fbm(p * uNoiseScale);
    vec3 color = mix(uColor1, uColor2, pattern);
    color = mix(color, uColor3, smoothstep(0.3, 0.7, pattern));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
