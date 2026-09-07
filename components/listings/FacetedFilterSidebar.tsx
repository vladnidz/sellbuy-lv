'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Minimal interface based on schema route
interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string> | string;
  options?: string[];
  required: boolean;
}

interface FacetedFilterSidebarProps {
  fields: SchemaField[];
  onFilterChange: (filters: Record<string, any>) => void;
}

export function FacetedFilterSidebar({ fields, onFilterChange }: FacetedFilterSidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-64 space-y-6"
    >
      <Card className="glass-morphism border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-4 space-y-6">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label className="text-sm font-medium text-white/80">
                {typeof field.label === 'string' ? field.label : (field.label.en || field.label.lv || field.name)}
              </Label>
              {field.type === 'enum' && field.options && (
                <div className="space-y-1">
                  {field.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox id={`${field.name}-${option}`} />
                      <label htmlFor={`${field.name}-${option}`} className="text-sm text-white/60">{option}</label>
                    </div>
                  ))}
                </div>
              )}
              {field.type === 'number' && (
                <div className="pt-2">
                   <Slider defaultValue={[0]} max={100} step={1} />
                </div>
              )}
              {field.type === 'string' && (
                 <Input className="bg-white/5 border-white/10 text-white" placeholder={`Search ${typeof field.label === 'string' ? field.label : field.label.en}...`} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.aside>
  );
}
