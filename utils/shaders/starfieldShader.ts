import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const STARFIELD_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float star(vec2 uv, float flare) {
    float d = length(uv);
    float m = 0.05 / d;
    float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
    m += rays * flare;
    m *= smoothstep(0.5, 0.2, d);
    return m;
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 5.0;
    
    vec3 color = vec3(0.0);
    for(float i=0.0; i<1.0; i+=1.0/4.0) {
        float depth = fract(i + time * 0.1);
        float scale = mix(20.0, 0.5, depth);
        float fade = depth * smoothstep(1.0, 0.9, depth);
        vec2 gv = fract(p * scale) - 0.5;
        vec2 id = floor(p * scale);
        vec2 r = fract(sin(id * 123.45) * 678.9) - 0.5;
        float s = star(gv - r, smoothstep(0.9, 1.0, depth));
        vec3 starColor = mix(uColor1, uColor2, fract(sin(id.x * 45.6) * 78.9));
        color += s * fade * starColor;
    }
    
    color = mix(color, uColor3, length(uv - 0.5) * 0.2);
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
