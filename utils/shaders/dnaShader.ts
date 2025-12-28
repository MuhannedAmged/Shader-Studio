import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const DNA_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 4.0;
    
    float v = 0.0;
    
    // Double Helix
    for (float i = 0.0; i < 2.0; i++) {
        float t = time + i * PI;
        float y = sin(p.x * 2.0 + t) * 0.5;
        float d = length(vec2(p.x, p.y - y));
        v += 0.05 / (d + 0.01);
        
        // Rungs
        if (abs(p.x * 10.0 - floor(p.x * 10.0 + 0.5)) < 0.1) {
             float y2 = sin(p.x * 2.0 + t + PI) * 0.5;
             if (p.y < max(y, y2) && p.y > min(y, y2)) {
                 v += 0.5 * uStrength;
             }
        }
    }
    
    vec3 color = mix(uColor3, uColor1, v * 0.5);
    color = mix(color, uColor2, smoothstep(0.0, 1.0, v * 0.2));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
