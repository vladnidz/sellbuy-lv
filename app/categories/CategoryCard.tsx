"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryWithCounts } from "./page";

interface CategoryCardProps {
  category: CategoryWithCounts;
  index: number;
  level?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  transports: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  nekustamie_ipasumi: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  elektronika_sadzives_tehnika: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M2 9h20" />
    </svg>
  ),
  celtnieciba_remonts: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.663 17h4.673M4 21h16M12 3v4m0 12v4M4.93 4.93l2.83 2.83m9.9 9.9l2.83 2.83M8.34 15.66l2.83-2.83m7.07-7.07l2.83-2.83" />
    </svg>
  ),
  darbs_bizness: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  maja_darzs: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <path d="M12 15v-6l3-3" />
    </svg>
  ),
  apgerbi_aksesuari: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 18V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v13" />
      <path d="M18 10a5 5 0 0 0-10 0" />
      <path d="M12 2v2" />
      <path d="M9 20h6" />
    </svg>
  ),
  bernu_pasaule: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  lauksaimnieciba: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 22h20" />
      <path d="M6 16V4" />
      <path d="M10 12V4" />
      <path d="M14 8V4" />
      <path d="M18 6V4" />
    </svg>
  ),
  dzivnieki_zoo: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 12a4 4 0 0 0-4 4" />
      <path d="M20.94 8.53a8 8 0 0 0-9.88 0" />
      <circle cx="10" cy="8" r="2" />
      <circle cx="14" cy="8" r="2" />
      <path d="M23 17a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5" />
      <path d="M17 5h.01" />
    </svg>
  ),
  hobiji_atputa: () => (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2" />
      <path d="M21 7l-5 5V7" />
      <path d="M3 7l5 5V7" />
      <path d="M12 22v-10" />
      <path d="M7 7l5-5 5 5" />
    </svg>
  ),
};

function getCategoryIcon(categoryName: string) {
  const key = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/__+/g, "_")
    .replace(/^_|_$/g, "");

  const IconComponent = iconMap[key];
  if (IconComponent) {
    return <IconComponent className="text-blue-400" />;
  }

  // Fallback: use a generic package icon
  return (
    <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function CategoryCard({ category, index, level = 0 }: CategoryCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
    hover: {
      y: -4,
      scale: 1.01,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
    },
    tap: { scale: 0.98 },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  const isParent = category.children && category.children.length > 0;
  const listingCount = category._count?.listings || 0;
  const totalCount = isParent
    ? listingCount + (category.children?.reduce((sum: number, c: CategoryWithCounts) => sum + (c._count?.listings || 0), 0) || 0)
    : listingCount;

  return (
    <motion.article
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      layout
    >
      <Link
        href={`/listings?category=${category.id}`}
        className="group block h-full"
        aria-label={`Pārlūkot kategoriju ${category.name}${isParent ? " ar apakškategorijām" : ""}, ${totalCount} sludinājumi`}
      >
        <Card
          className={cn(
            "group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border-slate-800/50",
            "hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10",
            "transition-all duration-300",
            "data-[state=open]:border-blue-500/50 data-[state=open]:shadow-xl data-[state=open]:shadow-blue-500/20",
            level > 0 && "ml-4 border-l-2 border-blue-500/20 pl-4"
          )}
          data-slot="card"
        >
          <CardContent className="p-5 pt-6 pb-4 flex flex-col h-full">
            {/* Icon with animated background */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
                {getCategoryIcon(category.name)}
              </div>
            </div>

            {/* Category Info */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-200 truncate">
                {category.name}
              </h3>

              {isParent && category.children && category.children.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" role="list" aria-label="Apakškategorijas">
                  {category.children.slice(0, 4).map((child: CategoryWithCounts, i: number) => (
                    <motion.span
                      key={child.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                      animate={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.04, duration: 0.2 }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-full hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300 transition-all duration-200 cursor-pointer"
                      role="listitem"
                    >
                      {child.name}
                      {child._count?.listings && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-blue-950 text-blue-300 border-blue-800">
                          {child._count.listings}
                        </Badge>
                      )}
                    </motion.span>
                  ))}
                  {category.children.length > 4 && (
                    <Badge variant="outline" className="h-4 px-2 text-[10px] border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                      +{category.children.length - 4} vairāk
                    </Badge>
                  )}
                </div>
              )}

              {/* Listing Count */}
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span className="text-sm font-medium">
                    {totalCount} sludinājumu{totalCount !== 1 ? "i" : ""}
                  </span>
                </div>

                {isParent && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs bg-blue-950/50 text-blue-300 border-blue-800/50">
                    {category.children?.length || 0} apakškategoriju
                  </Badge>
                )}
              </div>
            </div>

            {/* Browse CTA - appears on hover */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 mt-4"
            >
              <Button
                variant="outline"
                className="w-full bg-blue-600/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20 hover:border-blue-500 hover:text-white transition-all duration-200"
                aria-label={`Atvērt ${category.name}`}
              >
                <span className="flex items-center justify-center gap-2">
                  Pārlūkot
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.article>
  );
}