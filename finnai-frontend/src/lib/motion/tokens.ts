export const motionTokens = {
  fast: 0.15,
  base: 0.22,
  slow: 0.32,
  easeOut: [0.22, 1, 0.36, 1] as const,
  spring: { type: "spring" as const, stiffness: 420, damping: 32 },
};
