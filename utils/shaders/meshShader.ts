import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const MESH_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec2 p1 = vec2(0.5 + 0.3 * sin(time * 0.7), 0.5 + 0.3 * cos(time * 0.8));
    vec2 p2 = vec2(0.5 + 0.3 * sin(time * 0.9 + 2.0), 0.5 + 0.3 * cos(time * 0.6 + 1.0));
    vec2 p3 = vec2(0.5 + 0.3 * sin(time * 0.5 + 4.0), 0.5 + 0.3 * cos(time * 1.1 + 3.0));
    
    float d1 = 1.0 / (length(uv - p1) * uDensity + 0.1);
    float d2 = 1.0 / (length(uv - p2) * uDensity + 0.1);
    float d3 = 1.0 / (length(uv - p3) * uDensity + 0.1);
    
    float sum = d1 + d2 + d3;
    vec3 color = (uColor1 * d1 + uColor2 * d2 + uColor3 * d3) / sum;
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
