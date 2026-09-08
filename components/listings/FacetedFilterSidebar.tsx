'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// SchemaField based on app/api/categories/schema/route.ts
interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string> | string;
  options?: string[];
  required: boolean;
  operators: string[];
}

interface FacetedFilterSidebarProps {
  fields: SchemaField[];
}

export function FacetedFilterSidebar({ fields }: FacetedFilterSidebarProps) {
  const getLabel = (label: Record<string, string> | string, name: string) => {
    return typeof label === 'string' ? label : (label.en || label.lv || name);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-72 space-y-6"
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Filters</h2>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          
          <AnimatePresence>
            {fields.map((field) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <Label className="text-sm font-semibold text-white/90">
                  {getLabel(field.label, field.name)}
                </Label>

                {field.type === 'enum' && field.options && (
                  <div className="grid grid-cols-1 gap-2">
                    {field.options.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Checkbox id={`${field.name}-${option}`} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                        <label htmlFor={`${field.name}-${option}`} className="text-sm text-white/70 cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {field.type === 'number' && (
                  <div className="pt-2">
                    <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
                  </div>
                )}

                {field.type === 'string' && (
                  <Input 
                    placeholder={`Search ${getLabel(field.label, field.name)}...`}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 transition-all rounded-lg"
                  />
                )}

                {field.type === 'boolean' && (
                  <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                    <Checkbox id={field.name} className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                    <label htmlFor={field.name} className="text-sm text-white/70">
                      Yes
                    </label>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.aside>
  );
}
