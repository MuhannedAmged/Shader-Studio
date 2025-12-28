import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const CAUSTICS_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

void main() {
    vec2 uv = vUv;
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = uTime * uSpeed;
    vec2 p = uv * uDensity;
    
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;

    for (int n = 0; n < 5; n++) {
        float t = time * (1.0 - (3.5 / float(n+1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x+t)/inten), p.y / (cos(i.y+t)/inten)));
    }
    
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    vec3 color = vec3(pow(abs(c), 8.0));
    color = clamp(color + uColor1, 0.0, 1.0);
    
    color = mix(color, uColor2, uStrength * 0.5);
    color = mix(color, uColor3, length(uv - 0.5));
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
