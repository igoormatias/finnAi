"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

import { THINKING_MESSAGES } from "../../utils/badge-catalog";
import { Card, CardContent } from "@/components/ui";

export const AIScoreThinking = () => {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % THINKING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 p-4 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label="IA analisando suas finanças"
      >
        <Card className="w-full max-w-md border-primary/30 shadow-[0_0_48px_rgba(53,224,161,0.15)]">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary"
            >
              <Brain className="h-8 w-8" aria-hidden />
            </motion.div>
            <p className="text-sm font-semibold text-foreground">FinnAI analisando…</p>
            <p className="text-xs text-muted">
              {reduceMotion ? THINKING_MESSAGES[0] : THINKING_MESSAGES[index]}
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
