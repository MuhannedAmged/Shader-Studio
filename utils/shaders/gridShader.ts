import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const GRID_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 grid = abs(fract(p - 0.5) - 0.5) / (0.1 + uSharpness * 0.1);
    float line = min(grid.x, grid.y);
    line = 1.0 - smoothstep(0.0, 0.1, line);
    
    float noise = fbm(uv * uNoiseScale + time * 0.1);
    vec3 color = mix(uColor1, uColor2, noise);
    color = mix(color, uColor3, line * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
