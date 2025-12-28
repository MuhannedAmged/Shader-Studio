import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const PLASMA_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = (uv - 0.5) * uDensity * 5.0;
    
    float v = sin(p.x + time);
    v += sin((p.y + time) / 2.0);
    v += sin((p.x + p.y + time) / 2.0);
    p += vec2(sin(time / 3.0), cos(time / 2.0));
    v += sin(sqrt(p.x*p.x + p.y*p.y + 1.0) + time);
    v = v / 2.0;
    
    vec3 color = vec3(sin(v * PI), sin(v * PI + 2.0 * PI / 3.0), sin(v * PI + 4.0 * PI / 3.0));
    color = mix(uColor1, color, uStrength);
    color = mix(color, uColor2, sin(v * PI));
    color = mix(color, uColor3, cos(v * PI));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
