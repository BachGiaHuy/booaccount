"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutGrid, 
  Gamepad2, 
  MonitorPlay, 
  Briefcase, 
  GraduationCap, 
  Crown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: "all", name: "Tất cả", icon: LayoutGrid },
  { id: "entertainment", name: "Giải trí", icon: MonitorPlay },
  { id: "productivity", name: "Làm việc", icon: Briefcase },
  { id: "education", name: "Học tập", icon: GraduationCap },
  { id: "premium", name: "Premium", icon: Crown },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
];

export function CategoryBar({ activeCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 mb-6">
      <div className="flex gap-2.5 justify-start">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-200 border font-bold",
                isActive 
                  ? "bg-primary text-black border-primary shadow-lg shadow-primary/20"
                  : "bg-card text-foreground border-border hover:bg-foreground/10 hover:text-foreground shadow-sm"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-black" : "text-primary")} />
              <span className="text-sm whitespace-nowrap">{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
