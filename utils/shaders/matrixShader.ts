import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const MATRIX_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 20.0;
    
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    
    float dropSpeed = 2.0 + random(vec2(ip.x, 0.0)) * 3.0;
    float y = mod(ip.y + time * dropSpeed, 20.0);
    
    float trail = smoothstep(15.0, 0.0, y);
    float head = step(0.0, y) * step(y, 1.0);
    
    float char = step(0.5, random(ip + floor(time * 5.0)));
    
    float brightness = (trail + head * 2.0) * char * uStrength;
    
    vec3 color = mix(uColor3, uColor1, brightness * 0.5);
    color = mix(color, uColor2, head * brightness);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
