"use client";

const COLORS = ["#20BEC6","#ED008C","#662D91","#008FD4","#F7901E","#FFCB05"];

interface Props { text: string }

export default function AnimatedSubtitle({ text }: Props) {
  const words = text.split(" ");
  return (
    <p className="text-lg max-w-md mx-auto flex flex-wrap justify-center gap-x-2">
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block cursor-default transition-all duration-200 hover:-translate-y-1 hover:font-semibold"
          style={{ color: "#6b7280" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS[i % COLORS.length] ?? "#20BEC6"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
