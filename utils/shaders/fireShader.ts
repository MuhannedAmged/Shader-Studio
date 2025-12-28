import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const FIRE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity;
    
    // Upward movement
    p.y -= time * 2.0;
    
    float n = fbm(p + fbm(p * 0.5));
    float fire = smoothstep(0.0, 1.0, n * uStrength + (1.0 - uv.y));
    
    vec3 color = mix(uColor1, uColor2, fire);
    color = mix(color, uColor3, fire * fire);
    
    // Core glow
    color += uColor2 * (fire * fire * 0.5);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
