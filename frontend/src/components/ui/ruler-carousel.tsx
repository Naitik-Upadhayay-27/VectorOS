"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Rewind, FastForward } from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
}

type InfiniteItem = Omit<CarouselItem, 'id'> & { id: string; originalIndex: number }

const createInfiniteItems = (originalItems: CarouselItem[]): InfiniteItem[] => {
  const items: InfiniteItem[] = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      items.push({ title: item.title, id: `${i}-${item.id}`, originalIndex: index });
    });
  }
  return items;
};

const RulerLines = ({ top = true, totalLines = 100 }: { top?: boolean; totalLines?: number }) => {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);
  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);
    let height = "h-3";
    let color = "bg-gray-600";
    if (isCenter) { height = "h-8"; color = "bg-white"; }
    else if (isFifth) { height = "h-4"; color = "bg-white"; }
    const positionClass = top ? "" : "bottom-0";
    lines.push(
      <div key={i} className={`absolute w-0.5 ${height} ${color} ${positionClass}`} style={{ left: `${i * lineSpacing}%` }} />
    );
  }
  return <div className="relative w-full h-8 px-4">{lines}</div>;
};

export function RulerCarousel({ originalItems }: { originalItems: CarouselItem[] }) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;
  const [activeIndex, setActiveIndex] = useState(itemsPerSet + 4);
  const [isResetting, setIsResetting] = useState(false);
  const previousIndexRef = useRef(itemsPerSet + 4);

  const handleItemClick = (newIndex: number) => {
    if (isResetting) return;
    const targetOriginalIndex = newIndex % itemsPerSet;
    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];
    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);
    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) { smallestDistance = distance; closestIndex = index; }
    }
    previousIndexRef.current = activeIndex;
    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => { if (!isResetting) setActiveIndex(p => p - 1); };
  const handleNext = () => { if (!isResetting) setActiveIndex(p => p + 1); };

  useEffect(() => {
    if (isResetting) return;
    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => { setActiveIndex(activeIndex + itemsPerSet); setIsResetting(false); }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => { setActiveIndex(activeIndex - itemsPerSet); setIsResetting(false); }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isResetting) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setActiveIndex(p => p - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setActiveIndex(p => p + 1); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetting]);

  const centerPosition = 5;
  const targetX = -500 + (centerPosition - (activeIndex % itemsPerSet)) * 500;
  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div className="w-full py-16 flex flex-col items-center justify-center bg-[#030303]">
      <div className="w-full h-[200px] flex flex-col justify-center relative">
        <RulerLines top />
        <div className="flex items-center justify-center w-full h-full relative overflow-hidden">
          <motion.div
            className="flex items-center gap-[100px]"
            animate={{ x: targetX }}
            transition={isResetting ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 20, mass: 1 }}
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(index)}
                  className={`text-4xl md:text-6xl font-bold whitespace-nowrap cursor-pointer flex items-center justify-center ${
                    isActive ? "text-white" : "text-gray-600 hover:text-gray-400"
                  }`}
                  animate={{ scale: isActive ? 1 : 0.75, opacity: isActive ? 1 : 0.4 }}
                  transition={isResetting ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 25 }}
                  style={{ width: "400px" }}
                >
                  {item.title}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
        <RulerLines top={false} />
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={handlePrevious} disabled={isResetting} className="cursor-pointer" aria-label="Previous">
          <Rewind className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" />
        </button>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span>{currentPage}</span>
          <span>/</span>
          <span>{totalPages}</span>
        </div>
        <button onClick={handleNext} disabled={isResetting} className="cursor-pointer" aria-label="Next">
          <FastForward className="w-5 h-5 text-white/40 hover:text-white/70 transition-colors" />
        </button>
      </div>
    </div>
  );
}
