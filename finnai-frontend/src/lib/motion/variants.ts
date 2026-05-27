import type { Variants } from "framer-motion";

import { motionTokens } from "./tokens";

const t = motionTokens;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: t.fast, ease: t.easeOut } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: t.base, ease: t.easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: t.base, ease: t.easeOut } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: t.base, ease: t.easeOut } },
};

export const drawerSlide: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: t.slow, ease: t.easeOut } },
  exit: { x: "-100%", transition: { duration: t.fast, ease: t.easeOut } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: t.base, ease: t.easeOut } },
};
