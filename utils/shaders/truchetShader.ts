import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const TRUCHET_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float hash12(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 gv = fract(p) - 0.5;
    vec2 id = floor(p);
    
    float n = hash12(id);
    if(n < 0.5) gv.x *= -1.0;
    
    float d = abs(abs(gv.x + gv.y) - 0.5);
    float mask = smoothstep(0.1 + uSharpness * 0.1, 0.0, d);
    
    vec3 color = mix(uColor1, uColor2, fbm(uv * uNoiseScale + time * 0.1));
    color = mix(color, uColor3, mask * uStrength);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
