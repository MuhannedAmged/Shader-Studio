import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_FRAGMENT_SHADER } from "../utils/shaderUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to ensure the model acts as a GLSL expert compatible with our Three.js setup.
const SYSTEM_INSTRUCTION = `
You are an expert Graphics Engineer specializing in WebGL and GLSL.
Your task is to generate GLSL Fragment Shaders compatible with React Three Fiber.

The shader MUST:
1. Be a fragment shader only.
2. Accept the following uniforms:
   - uniform float uTime;
   - uniform vec3 uColor1;
   - uniform vec3 uColor2;
   - uniform vec3 uColor3;
   - uniform float uSpeed;
   - uniform float uDensity;
   - uniform float uStrength;
   - uniform float uHue;        // 0.0 to 6.28
   - uniform float uSaturation; // 0.0 to 2.0
   - uniform float uBrightness; // 0.0 to 2.0
   // Noise Controls
   - uniform float uNoiseScale;       // 0.1 to 5.0
   - uniform int uNoiseOctaves;       // 1 to 8
   - uniform float uNoisePersistence; // 0.0 to 1.0
   - varying vec2 vUv; (passed from vertex shader)
3. Output gl_FragColor.
4. Be visually stunning, using noise, gradients, or geometric patterns.
5. BE ROBUST. No syntax errors.

You must return a JSON object with:
- fragmentShader: The raw GLSL code string.
- description: A short description of what you created.
`;

export const generateShaderCode = async (prompt: string): Promise<{ fragmentShader: string; description: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using Pro for better coding capabilities
      contents: `Create a GLSL fragment shader that looks like: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fragmentShader: {
              type: Type.STRING,
              description: "The valid GLSL fragment shader code.",
            },
            description: {
              type: Type.STRING,
              description: "Short description of the visual effect.",
            },
          },
          required: ["fragmentShader", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate shader:", error);
    // Fallback to default if AI fails
    return {
      fragmentShader: DEFAULT_FRAGMENT_SHADER,
      description: "Fallback shader due to generation error."
    };
  }
};