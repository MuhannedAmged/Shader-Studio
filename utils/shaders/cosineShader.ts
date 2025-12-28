import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const COSINE_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

vec3 palette(float t) {
    return uColor1 + uColor2 * cos(6.28318 * (uColor3 * t + vec3(0.0, 0.33, 0.67) * uStrength));
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity;
    
    float d = length(p);
    d = sin(d * 8.0 + time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2 * (1.0 + uSharpness));
    
    vec3 color = palette(length(p) + time);
    color *= d;
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
