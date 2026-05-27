"use client";

import { motion, useReducedMotion } from "framer-motion";

import { staggerContainer, staggerItem } from "@/lib/motion/variants";

export const StaggerChildren = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
};
