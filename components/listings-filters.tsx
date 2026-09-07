'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string>;
  options?: string[];
  required: boolean;
  operators: string[];
}

export function ListingsFilters() {
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch('/api/categories/schema')
      .then((res) => res.json())
      .then((data) => setSchema(data))
      .catch(console.error);
  }, []);

  const updateFilters = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-72 p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl space-y-8"
    >
      <h2 className="text-2xl font-semibold text-white tracking-tight">Filtri</h2>
      
      <div className="space-y-6">
        {schema.map((field) => (
          <div key={field.name} className="space-y-3">
            <Label className="text-sm font-medium text-slate-300">
              {field.label.lv || field.name}
            </Label>
            
            {field.type === 'enum' && field.options && (
              <div className="grid grid-cols-1 gap-2">
                {field.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.name}-${option}`}
                      checked={searchParams.get(field.name) === option}
                      onCheckedChange={(checked) => 
                        updateFilters(field.name, checked ? option : undefined)
                      }
                      className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <Label htmlFor={`${field.name}-${option}`} className="text-sm text-slate-400">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {field.type === 'boolean' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={searchParams.get(field.name) === 'true'}
                  onCheckedChange={(checked) => 
                    updateFilters(field.name, checked ? 'true' : undefined)
                  }
                  className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                />
                <Label htmlFor={field.name} className="text-sm text-slate-400">
                  {field.label.lv || 'Jā'}
                </Label>
              </div>
            )}
            
            {/* Add support for 'number' and 'string' if needed later */}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
