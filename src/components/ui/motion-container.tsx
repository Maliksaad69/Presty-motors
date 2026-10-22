"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";
import React from "react";

// Standard motorsport ease
export const motorsportEase = [0.22, 1, 0.36, 1] as const;

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: motorsportEase,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: motorsportEase,
    },
  },
};

interface MotionSectionProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode;
}

export function MotionSection({ children, className, ...props }: MotionSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

interface MotionStaggerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function MotionStagger({ children, className, ...props }: MotionStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeInUp} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
