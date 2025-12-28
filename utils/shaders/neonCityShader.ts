import { COMMON_UNIFORMS_AND_UTILS } from "./common";

export const NEON_CITY_FRAGMENT_SHADER = `
${COMMON_UNIFORMS_AND_UTILS}

float grid(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    return step(0.95, max(grid.x, grid.y));
}

void main() {
    vec2 uv = transformUV(vUv);
    if (uPixelation > 0.0) {
        float pixels = 200.0 * (1.1 - uPixelation);
        uv = floor(uv * pixels) / pixels;
    }
    float time = (uTime + uTimeOffset) * uSpeed;
    
    // Perspective grid
    vec2 p = uv - 0.5;
    float horizon = 0.2;
    float fov = 0.5;
    
    // 3D projection simulation
    float z = 1.0 / (abs(p.y - horizon) + 0.01);
    vec2 gridUV = vec2(p.x * z * fov, z);
    gridUV.y -= time * 2.0;
    
    float g = grid(gridUV, 5.0 * uDensity);
    float glow = smoothstep(0.0, 1.0, z * 0.05);
    
    // Sun
    float sunDist = length(p - vec2(0.0, 0.1));
    float sun = smoothstep(0.3, 0.29, sunDist);
    float sunGlow = smoothstep(0.5, 0.3, sunDist);
    
    // Scanlines on sun
    float sunLines = step(0.1, fract(p.y * 20.0 + time * 0.5));
    sun *= sunLines;
    
    vec3 color = vec3(0.0);
    
    // Grid color
    color += mix(vec3(0.0), uColor1, g * glow * uStrength);
    
    // Background/Sky
    color += mix(uColor3, vec3(0.0), p.y + 0.5);
    
    // Sun color
    color += mix(vec3(0.0), uColor2, sun + sunGlow * 0.5);
    
    color = applyCorrections(color);
    gl_FragColor = vec4(applyPostEffects(color, uv), 1.0);
}
`;
