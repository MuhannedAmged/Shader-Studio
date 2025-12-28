import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const CLOUD_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity;
    
    float n1 = fbm(p * 2.0 + time * 0.1);
    float n2 = fbm(p * 4.0 - time * 0.05 + n1);
    float cloud = smoothstep(0.3, 0.7, n2 * uStrength + 0.5 * uv.y);
    
    vec3 color = mix(uColor1, uColor2, cloud);
    color = mix(color, uColor3, n1 * 0.5);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
