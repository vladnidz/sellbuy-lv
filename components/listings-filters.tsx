'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: Record<string, string>;
  options?: string[];
  required: boolean;
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
      className="w-full md:w-64 p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl space-y-6"
    >
      <h2 className="text-xl font-bold text-white mb-4">Filtri</h2>
      
      {schema.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label className="text-slate-300">{field.label.lv || field.name}</Label>
          
          {field.type === 'enum' && field.options && (
            <div className="space-y-1">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`${field.name}-${option}`}
                    checked={searchParams.get(field.name) === option}
                    onCheckedChange={(checked) => 
                      updateFilters(field.name, checked ? option : undefined)
                    }
                  />
                  <Label htmlFor={`${field.name}-${option}`} className="text-slate-400">{option}</Label>
                </div>
              ))}
            </div>
          )}

          {field.type === 'number' && (
            <div className="pt-2">
              <Slider 
                defaultValue={[0]} 
                max={1000} 
                step={1}
                onValueCommit={(value) => updateFilters(field.name, value[0].toString())}
              />
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
