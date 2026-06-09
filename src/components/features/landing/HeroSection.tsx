"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import AuroraArrows from "./AuroraArrows";
import { IconArrowRight, IconUsers } from "@/components/ui/icons";

interface HeroSectionProps {
  locale: string;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.5, 0.27, 1] as const } },
};

const STATS = [
  { value: "+2.500", label: "Talentos activos" },
  { value: "+480", label: "Empresas" },
  { value: "+1.200", label: "Proyectos lanzados" },
];

export default function HeroSection({ locale }: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-24 sm:px-10 sm:pt-28">
      <AuroraArrows />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.h1
          variants={item}
          className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-7xl"
        >
          Avancemos hacia el
          <br />
          <span className="text-gradient-fwd">Futuro Digital Juntos</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-lg text-text-muted sm:text-xl"
        >
          Conectamos talento, innovación, emprendimiento y tecnología en una sola plataforma
          diseñada para construir el futuro de Costa Rica.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button href={`/${locale}/marketplace`} size="lg">
            Explorar Marketplace
            <IconArrowRight />
          </Button>
          <Button href={`/${locale}/register`} size="lg" variant="outline">
            <IconUsers width={18} height={18} />
            Únete a la Comunidad
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-4 py-5">
              <p className="font-display text-2xl font-bold text-text sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-text-muted sm:text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
