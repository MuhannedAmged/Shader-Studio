import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const SPIRAL_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv - 0.5;
    
    float r = length(p) * uDensity;
    float a = atan(p.y, p.x);
    
    float spiral = sin(r * 10.0 - a * 3.0 + time);
    spiral = smoothstep(-0.1, 0.1, spiral / (0.1 + uSharpness));
    
    vec3 color = mix(uColor1, uColor2, spiral);
    color = mix(color, uColor3, r * 0.5);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
