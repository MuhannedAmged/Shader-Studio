import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const RAYMARCHING_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

float map(vec3 p) {
    float time = uTime * uSpeed;
    vec3 q = mod(p + 2.0, 4.0) - 2.0;
    float s1 = sdSphere(q, 1.0 + sin(time + p.x) * 0.2 * uStrength);
    return s1;
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    vec2 p = (uv - 0.5) * 2.0;
    float time = (uTime + uTimeOffset) * uSpeed;
    
    vec3 ro = vec3(0.0, 0.0, -5.0 + time);
    vec3 rd = normalize(vec3(p, 1.0));
    
    float t = 0.0;
    for(int i=0; i<32; i++) {
        vec3 pos = ro + rd * t;
        float h = map(pos);
        if(h < 0.001 || t > 20.0) break;
        t += h;
    }
    
    vec3 color = uColor1;
    if(t < 20.0) {
        vec3 pos = ro + rd * t;
        vec2 eps = vec2(0.001, 0.0);
        vec3 nor = normalize(vec3(
            map(pos+eps.xyy) - map(pos-eps.xyy),
            map(pos+eps.yxy) - map(pos-eps.yxy),
            map(pos+eps.yyx) - map(pos-eps.yyx)
        ));
        float diff = max(0.0, dot(nor, normalize(vec3(1,2,-3))));
        color = mix(uColor2, uColor3, diff);
    }
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
