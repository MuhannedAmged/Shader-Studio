import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const OCEAN_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity;
    
    float wave1 = sin(p.x * 2.0 + time) * 0.1;
    float wave2 = sin(p.y * 3.0 - time * 0.5) * 0.1;
    float sea = fbm(p + vec2(wave1, wave2));
    
    vec3 color = mix(uColor1, uColor2, sea * uStrength);
    color = mix(color, uColor3, uv.y);
    
    // Highlights
    color += pow(max(0.0, sea), 10.0) * 0.5;
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
