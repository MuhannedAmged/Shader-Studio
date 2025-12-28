import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const CIRCUIT_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float circuit(vec2 p) {
    p = fract(p);
    float r = 0.3;
    float v = 0.0;
    float l = length(p - 0.5);
    v += smoothstep(r, r - 0.02, l) - smoothstep(r - 0.05, r - 0.07, l);
    v += dot(p, p); // subtle noise
    return v;
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 8.0;
    
    vec2 id = floor(p);
    vec2 gv = fract(p) - 0.5;
    
    float n = fbm(id * 0.1 + time * 0.05);
    
    float mask = 0.0;
    if (n > 0.5) {
        float width = 0.1;
        float d = min(abs(gv.x), abs(gv.y));
        mask = smoothstep(width, width - 0.02, d);
        
        // Nodes
        if (length(gv) < 0.2) mask = 1.0;
    }
    
    // Pulse
    float pulse = sin(n * 10.0 + time * 5.0) * 0.5 + 0.5;
    
    vec3 color = mix(uColor3, uColor1, mask * 0.5);
    color = mix(color, uColor2, mask * pulse * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
