import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Copy,
  Check,
  Terminal,
  Sparkles,
  Code2,
  Cpu,
  Zap,
} from "lucide-react";
import Prism from "prismjs";
import { motion, AnimatePresence } from "framer-motion";
const MotionDiv = motion.div as any;
import { ShaderConfig } from "../types";
import { generateStandaloneShader } from "../utils/shaderUtils";

// Initialization block for Prism language definition
try {
  if (Prism && !Prism.languages.glsl) {
    Prism.languages.glsl = {
      comment: [
        { pattern: /\/\*[\s\S]*?\*\//, greedy: true },
        { pattern: /\/\/.*/, greedy: true },
      ],
      preprocessor: {
        pattern: /(^[ \t]*)#.*/m,
        lookbehind: true,
      },
      string: {
        pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
        greedy: true,
      },
      keyword:
        /\b(?:attribute|const|uniform|varying|break|continue|do|for|while|if|else|in|out|inout|float|int|void|bool|true|false|lowp|mediump|highp|precision|discard|return|mat2|mat3|mat4|vec2|vec3|vec4|ivec2|ivec3|ivec4|bvec2|bvec3|bvec4|sampler2D|samplerCube|struct)\b/,
      function: /\b[a-z_]\w*(?=\s*\()/i,
      number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
      operator: /[<>]=?|[!=]=?={0,2}|[-+*/%^&|?]|[~!]|\b(?:and|or|not)\b/,
      punctuation: /[{}[\];(),.]/,
      builtin:
        /\b(?:gl_FragColor|gl_FragCoord|gl_Position|gl_PointSize|gl_FragDepth|gl_FrontFacing|gl_PointCoord|texture2D|mix|sin|cos|tan|asin|acos|atan|pow|exp|log|sqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract)\b/,
    };
  }
} catch (e) {
  console.warn("Prism initialization failed", e);
}

// GLSL Keywords and Uniforms for Autocomplete
const GLSL_KEYWORDS = [
  "void",
  "bool",
  "int",
  "float",
  "vec2",
  "vec3",
  "vec4",
  "mat2",
  "mat3",
  "mat4",
  "sampler2D",
  "uniform",
  "varying",
  "const",
  "in",
  "out",
  "inout",
  "if",
  "else",
  "for",
  "while",
  "do",
  "return",
  "break",
  "continue",
  "struct",
  "precision",
  "highp",
  "mediump",
  "lowp",
  "gl_FragColor",
  "gl_FragCoord",
  "texture2D",
  "mix",
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "pow",
  "exp",
  "log",
  "sqrt",
  "abs",
  "sign",
  "floor",
  "ceil",
  "fract",
  "mod",
  "min",
  "max",
  "clamp",
  "step",
  "smoothstep",
  "length",
  "distance",
  "dot",
  "cross",
  "normalize",
  "reflect",
  "refract",
];

const APP_UNIFORMS = [
  "uTime",
  "uColor1",
  "uColor2",
  "uColor3",
  "uSpeed",
  "uDensity",
  "uStrength",
  "uHue",
  "uSaturation",
  "uBrightness",
  "vUv",
  "uNoiseScale",
  "uNoiseOctaves",
  "uNoisePersistence",
  "uDistortion",
  "uWarp",
  "uGrain",
  "uPixelation",
];

const ALL_SUGGESTIONS = [...APP_UNIFORMS, ...GLSL_KEYWORDS];

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onChange: (newCode: string) => void;
  config: ShaderConfig;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  isOpen,
  onClose,
  code,
  onChange,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShadertoy, setShowShadertoy] = useState(false);
  const [localCode, setLocalCode] = useState(code);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [caretCoords, setCaretCoords] = useState({ x: 0, y: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus restoration
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus textarea on open
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape and Focus Trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && suggestions.length === 0) {
        onClose();
      }

      if (e.key === "Tab") {
        const focusableElements = wrapperRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose, suggestions.length]);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  // Sync scroll between container and line numbers
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  // Ensure textarea height matches content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";

      // Also update pre height
      if (preRef.current) {
        preRef.current.style.height = textareaRef.current.style.height;
      }
    }
  }, [localCode]);

  const handleCopy = () => {
    const textToCopy = showShadertoy
      ? generateStandaloneShader(config)
      : localCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Autocomplete Logic
  const getCaretCoordinates = (
    element: HTMLTextAreaElement,
    position: number
  ) => {
    const div = document.createElement("div");
    const style = window.getComputedStyle(element);

    // Copy styles to replicate textarea environment
    Array.from(style).forEach((prop) => {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    });

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.top = "0";
    div.style.left = "0";

    // Text up to cursor
    div.textContent = element.value.substring(0, position);

    // Create span for caret
    const span = document.createElement("span");
    span.textContent = element.value.substring(position) || ".";
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetLeft, offsetTop } = span;

    // Account for scrolling
    const relativeTop = offsetTop - element.scrollTop;
    const relativeLeft = offsetLeft - element.scrollLeft;

    document.body.removeChild(div);
    return { x: relativeLeft, y: relativeTop };
  };

  const updateSuggestions = (text: string, cursorPosition: number) => {
    // Find word fragment before cursor
    let start = cursorPosition - 1;
    while (start >= 0 && /[\w]/.test(text[start])) {
      start--;
    }
    start++;

    const wordFragment = text.substring(start, cursorPosition);

    if (wordFragment.length > 1) {
      const matches = ALL_SUGGESTIONS.filter(
        (s) => s.startsWith(wordFragment) && s !== wordFragment
      );
      setSuggestions(matches.slice(0, 8)); // Limit to 8
      setSuggestionIndex(0);

      if (textareaRef.current && matches.length > 0) {
        const coords = getCaretCoordinates(textareaRef.current, cursorPosition);
        setCaretCoords(coords);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalCode(newVal);
    onChange(newVal);
    updateSuggestions(newVal, e.target.selectionEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySuggestion(suggestions[suggestionIndex]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    }

    // Basic indentation
    if (e.key === "Tab" && suggestions.length === 0) {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newVal =
        localCode.substring(0, start) + "  " + localCode.substring(end);
      setLocalCode(newVal);
      onChange(newVal);
      // Need to defer cursor update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;

    const cursor = textareaRef.current.selectionEnd;
    const text = localCode;

    // Find start of word
    let start = cursor - 1;
    while (start >= 0 && /[\w]/.test(text[start])) {
      start--;
    }
    start++;

    const newVal =
      text.substring(0, start) + suggestion + text.substring(cursor);
    setLocalCode(newVal);
    onChange(newVal);
    setSuggestions([]);

    // Move cursor to end of inserted word
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursor = start + suggestion.length;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          newCursor;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Rendering
  const lineNumbers = useMemo(() => {
    const lines = localCode.split("\n").length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  }, [localCode]);

  const highlightedCode = useMemo(() => {
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    try {
      if (Prism && Prism.languages && Prism.languages.glsl) {
        return Prism.highlight(localCode, Prism.languages.glsl, "glsl");
      }
    } catch (e) {
      console.error("Highlighting error:", e);
    }
    return escapeHtml(localCode);
  }, [localCode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <MotionDiv
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed top-0 right-0 h-full w-full md:w-[650px] z-[70] flex flex-col bg-[#0a0a0a]/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            ref={wrapperRef}
          >
            {/* Header */}
            <div className="px-6 py-5 pb-2 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h3
                    id="modal-title"
                    className="text-sm font-bold text-white flex items-center gap-2.5 tracking-tight"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                    </div>
                    Shader Studio
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1 ml-9 font-medium uppercase tracking-widest">
                    GLSL Editor • v1.5.0
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-white group"
                    title="Copy Code"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <button
                    onClick={() => setShowShadertoy(!showShadertoy)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium border ${
                      showShadertoy
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-200"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Toggle Shadertoy Compatibility"
                  >
                    <Sparkles
                      className={`w-3.5 h-3.5 ${
                        showShadertoy ? "animate-pulse" : ""
                      }`}
                    />
                    <span>
                      {showShadertoy ? "Shadertoy Mode" : "Generic GLSL"}
                    </span>
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1" />

                  <button
                    onClick={onClose}
                    aria-label="Close Editor"
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showShadertoy && (
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2"
                  >
                    <div className="w-fit mx-auto px-6 py-2 bg-indigo-500/5 border rounded-xl border-indigo-500/10">
                      <p className="text-[10px] text-indigo-300 font-medium">
                        <Sparkles className="w-3 h-3 inline-block mr-1 mb-0.5" />
                        Shadertoy compatibility mode enabled. Uniforms are
                        mapped to iTime, iResolution, etc.
                      </p>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 bg-[#0d0d0d] overflow-hidden group/editor">
              {/* Line Numbers */}
              <div
                ref={lineNumbersRef}
                className="absolute left-0 top-0 bottom-0 w-14 bg-[#0a0a0a] border-r border-white/5 text-right font-mono text-[11px] leading-6 text-gray-700 select-none pt-6 pr-4 overflow-hidden z-10 transition-colors group-hover/editor:text-gray-500"
              >
                {lineNumbers.map((n) => (
                  <div key={n} className="h-6">
                    {n}
                  </div>
                ))}
              </div>

              {/* Scrollable Container */}
              <div
                className="absolute inset-0 left-14 overflow-auto editor-scrollbar selection:bg-indigo-500/30"
                onScroll={handleScroll}
              >
                <div className="relative min-w-full min-h-full">
                  {/* Syntax Highlight Layer */}
                  <pre
                    ref={preRef}
                    className="absolute top-0 left-0 m-0 p-6 font-mono text-[13px] leading-6 w-full pointer-events-none whitespace-pre border-none overflow-hidden"
                    aria-hidden="true"
                    style={{
                      tabSize: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                      boxSizing: "border-box",
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        (showShadertoy
                          ? Prism.highlight(
                              generateStandaloneShader(config),
                              Prism.languages.glsl,
                              "glsl"
                            )
                          : highlightedCode) + "<br />",
                    }}
                  />

                  {/* Input Layer */}
                  <textarea
                    ref={textareaRef}
                    id="glsl-editor"
                    value={
                      showShadertoy
                        ? generateStandaloneShader(config)
                        : localCode
                    }
                    readOnly={showShadertoy}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    wrap="off"
                    aria-label="GLSL Code Editor"
                    aria-multiline="true"
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                    aria-expanded={suggestions.length > 0}
                    aria-activedescendant={
                      suggestions.length > 0
                        ? `suggestion-${suggestionIndex}`
                        : undefined
                    }
                    className="absolute top-0 left-0 w-full m-0 p-6 font-mono text-[13px] leading-6 bg-transparent text-transparent caret-indigo-400 resize-none focus:outline-none whitespace-pre border-none overflow-hidden"
                    style={{
                      tabSize: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Autocomplete Popup */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute z-50 min-w-[180px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col p-1.5"
                    style={{
                      top: caretCoords.y + 28 + "px",
                      left: caretCoords.x + "px",
                    }}
                  >
                    <div
                      role="listbox"
                      aria-label="Code Suggestions"
                      className="flex flex-col"
                    >
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={suggestion}
                          id={`suggestion-${idx}`}
                          role="option"
                          aria-selected={idx === suggestionIndex}
                          onClick={() => applySuggestion(suggestion)}
                          className={`px-3 py-2 text-left text-[11px] font-mono rounded-lg transition-all flex items-center justify-between group/item ${
                            idx === suggestionIndex
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                              : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {APP_UNIFORMS.includes(suggestion) ? (
                              <Zap
                                className={`w-3 h-3 ${
                                  idx === suggestionIndex
                                    ? "text-indigo-200"
                                    : "text-indigo-500"
                                }`}
                              />
                            ) : (
                              <Code2
                                className={`w-3 h-3 ${
                                  idx === suggestionIndex
                                    ? "text-gray-200"
                                    : "text-gray-600"
                                }`}
                              />
                            )}
                            <span>{suggestion}</span>
                          </div>
                          {APP_UNIFORMS.includes(suggestion) && (
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                idx === suggestionIndex
                                  ? "bg-white/20 text-white"
                                  : "bg-indigo-500/10 text-indigo-400"
                              }`}
                            >
                              Uniform
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-[#0a0a0a] text-[11px] text-gray-500 font-mono flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-md border border-white/5">
                  <span className="text-gray-400">Line</span>
                  <span className="text-indigo-400 font-bold">
                    {textareaRef.current
                      ? localCode
                          .substring(0, textareaRef.current.selectionEnd)
                          .split("\n").length
                      : 1}
                  </span>
                  <span className="text-gray-600 mx-0.5">/</span>
                  <span className="text-gray-400">Col</span>
                  <span className="text-indigo-400 font-bold">
                    {textareaRef.current
                      ? textareaRef.current.selectionEnd -
                        (localCode.lastIndexOf(
                          "\n",
                          textareaRef.current.selectionEnd - 1
                        ) +
                          1) +
                        1
                      : 1}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>WebGL 2.0</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 text-green-500/70 rounded-full border border-green-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Live Sync
                  </span>
                </div>
              </div>
            </div>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default CodeEditor;
