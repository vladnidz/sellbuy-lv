'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Attribute {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string>;
  options?: string[];
  required: boolean;
}

interface FacetedFilterSidebarProps {
  attributes: Attribute[];
  currentParams: Record<string, string | undefined>;
  onFilterChange: (key: string, value: string | undefined) => void;
}

export function FacetedFilterSidebar({ attributes, currentParams, onFilterChange }: FacetedFilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="w-full md:w-64 space-y-4 p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-2xl">
      <h2 className="text-lg font-semibold text-white">Filtri</h2>
      {attributes.map((attr) => (
        <div key={attr.name} className="border-b border-slate-800/60 pb-4">
          <button
            onClick={() => toggleSection(attr.name)}
            className="flex w-full items-center justify-between text-sm font-medium text-slate-300 hover:text-white"
          >
            {attr.label.lv}
            {expandedSections[attr.name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {expandedSections[attr.name] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {attr.type === 'enum' && attr.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${attr.name}-${option}`}
                        checked={currentParams[attr.name] === option}
                        onCheckedChange={(checked) => onFilterChange(attr.name, checked ? option : undefined)}
                        className="border-slate-600 data-[state=checked]:bg-indigo-500"
                      />
                      <Label htmlFor={`${attr.name}-${option}`} className="text-sm text-slate-400">{option}</Label>
                    </div>
                  ))}
                  {attr.type === 'number' && (
                    <div className="pt-2">
                       <Slider 
                         defaultValue={[0, 1000]} 
                         max={1000} 
                         step={10}
                         className="w-full"
                         onValueChange={(val) => onFilterChange(attr.name, val.join('-'))}
                       />
                    </div>
                  )}
                  {attr.type === 'boolean' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={attr.name}
                        checked={currentParams[attr.name] === 'true'}
                        onCheckedChange={(checked) => onFilterChange(attr.name, checked ? 'true' : undefined)}
                        className="border-slate-600 data-[state=checked]:bg-indigo-500"
                      />
                      <Label htmlFor={attr.name} className="text-sm text-slate-400">Jā</Label>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
