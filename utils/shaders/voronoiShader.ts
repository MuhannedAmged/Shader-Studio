import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const VORONOI_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    vec2 p = uv * uDensity * 5.0;
    
    vec2 n = floor(p);
    vec2 f = fract(p);
    
    float m_dist = 1.0;
    for (int j=-1; j<=1; j++) {
        for (int i=-1; i<=1; i++) {
            vec2 g = vec2(float(i),float(j));
            vec2 o = hash2(n + g);
            o = 0.5 + 0.5*sin(time + 6.2831*o);
            vec2 r = g + o - f;
            float d = dot(r,r);
            m_dist = min(m_dist, d);
        }
    }
    
    float pattern = 1.0 - smoothstep(0.0, 0.1 + uSharpness, m_dist * uStrength);
    vec3 color = mix(uColor1, uColor2, m_dist);
    color = mix(color, uColor3, pattern);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
