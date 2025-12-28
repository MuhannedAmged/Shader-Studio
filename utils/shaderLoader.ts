import { GradientType } from "../types";

export const getFragmentShader = async (
  type: GradientType
): Promise<string> => {
  switch (type) {
    case GradientType.NOISE:
      return (await import("./shaders/noiseShader")).NOISE_FRAGMENT_SHADER;
    case GradientType.FRACTAL:
      return (await import("./shaders/fractalShader")).FRACTAL_FRAGMENT_SHADER;
    case GradientType.LINEAR:
      return (await import("./shaders/linearShader")).LINEAR_FRAGMENT_SHADER;
    case GradientType.RADIAL:
      return (await import("./shaders/radialShader")).RADIAL_FRAGMENT_SHADER;
    case GradientType.MESH:
      return (await import("./shaders/meshShader")).MESH_FRAGMENT_SHADER;
    case GradientType.AURORA:
      return (await import("./shaders/auroraShader")).AURORA_FRAGMENT_SHADER;
    case GradientType.LIQUID:
      return (await import("./shaders/liquidShader")).LIQUID_FRAGMENT_SHADER;
    case GradientType.WAVE:
      return (await import("./shaders/waveShader")).WAVE_FRAGMENT_SHADER;
    case GradientType.COSINE:
      return (await import("./shaders/cosineShader")).COSINE_FRAGMENT_SHADER;
    case GradientType.CONIC:
      return (await import("./shaders/conicShader")).CONIC_FRAGMENT_SHADER;
    case GradientType.STRIPES:
      return (await import("./shaders/stripesShader")).STRIPES_FRAGMENT_SHADER;
    case GradientType.PLASMA:
      return (await import("./shaders/plasmaShader")).PLASMA_FRAGMENT_SHADER;
    case GradientType.VORONOI:
      return (await import("./shaders/voronoiShader")).VORONOI_FRAGMENT_SHADER;
    case GradientType.METABALLS:
      return (await import("./shaders/metaballsShader"))
        .METABALLS_FRAGMENT_SHADER;
    case GradientType.KALEIDOSCOPE:
      return (await import("./shaders/kaleidoscopeShader"))
        .KALEIDOSCOPE_FRAGMENT_SHADER;
    case GradientType.SPIRAL:
      return (await import("./shaders/spiralShader")).SPIRAL_FRAGMENT_SHADER;
    case GradientType.GRID:
      return (await import("./shaders/gridShader")).GRID_FRAGMENT_SHADER;
    case GradientType.CAUSTICS:
      return (await import("./shaders/causticsShader"))
        .CAUSTICS_FRAGMENT_SHADER;
    case GradientType.STARFIELD:
      return (await import("./shaders/starfieldShader"))
        .STARFIELD_FRAGMENT_SHADER;
    case GradientType.FLOW_FIELD:
      return (await import("./shaders/flowFieldShader"))
        .FLOW_FIELD_FRAGMENT_SHADER;
    case GradientType.RAYMARCHING:
      return (await import("./shaders/raymarchingShader"))
        .RAYMARCHING_FRAGMENT_SHADER;
    case GradientType.HALFTONE:
      return (await import("./shaders/halftoneShader"))
        .HALFTONE_FRAGMENT_SHADER;
    case GradientType.TRUCHET:
      return (await import("./shaders/truchetShader")).TRUCHET_FRAGMENT_SHADER;
    case GradientType.NEON_CITY:
      return (await import("./shaders/neonCityShader"))
        .NEON_CITY_FRAGMENT_SHADER;
    case GradientType.CIRCUIT:
      return (await import("./shaders/circuitShader")).CIRCUIT_FRAGMENT_SHADER;
    case GradientType.DNA:
      return (await import("./shaders/dnaShader")).DNA_FRAGMENT_SHADER;
    case GradientType.MATRIX:
      return (await import("./shaders/matrixShader")).MATRIX_FRAGMENT_SHADER;
    case GradientType.GLITCH:
      return (await import("./shaders/glitchShader")).GLITCH_FRAGMENT_SHADER;
    case GradientType.CLOUD:
      return (await import("./shaders/cloudShader")).CLOUD_FRAGMENT_SHADER;
    case GradientType.GALAXY:
      return (await import("./shaders/galaxyShader")).GALAXY_FRAGMENT_SHADER;
    case GradientType.OCEAN:
      return (await import("./shaders/oceanShader")).OCEAN_FRAGMENT_SHADER;
    case GradientType.FIRE:
      return (await import("./shaders/fireShader")).FIRE_FRAGMENT_SHADER;
    default:
      return (await import("./shaders/noiseShader")).NOISE_FRAGMENT_SHADER;
  }
};
