'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewListingPage() {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    images: [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit listing:', formData);
    // TODO: Implement actual submission with API route
    alert('Sludinājums iesniegts! (Demo mode)');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(e.target.files!),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sākumlapu
        </Link>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-3xl font-bold">Izveidot jaunu sludinājumu</CardTitle>
            <CardDescription className="text-slate-400">
              Aizpildiet formu, lai publicētu savu sludinājumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Nosaukums *
                </label>
                <Input
                  id="title"
                  placeholder="Piemēram: iPhone 15 Pro 256GB"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Kategorija *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Izvēlēties kategoriju</option>
                  <option value="transports">Transports</option>
                  <option value="nekustamie_ipasumi">Nekustamie īpašumi</option>
                  <option value="elektronika_sadzives_tehnika">Elektronika & Sadzīves tehnika</option>
                  <option value="celtnieciba_remonts">Celtniecība & Remonts</option>
                  <option value="darbs_bizness">Darbs & Bizness</option>
                  <option value="maja_darzs">Māja & Dārzs</option>
                  <option value="apgerbi_aksesuari">Apģērbi & Aksesuāri</option>
                  <option value="bernu_pasaule">Bērnu pasaule</option>
                  <option value="lauksaimnieciba">Lauksaimniecība</option>
                  <option value="dzivnieki_zoo">Dzīvnieki & Zoo</option>
                  <option value="hobiji_atputa">Hobiji & Atpūta</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
                  Cena (EUR) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Apraksts *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  placeholder="Aprakstiet savu priekšmetu detalizēti..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Attēli (vismaz 1, maksimum 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.images.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {formData.images.map((file, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-950 border border-blue-700 rounded-full text-sm text-blue-300">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-lg font-semibold">
                Publicēt sludinājumu
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Info */}
        <Card className="mt-8 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">Smart-ID</div>
                <div className="text-sm text-slate-400">Verifikācija</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Escrow</div>
                <div className="text-sm text-slate-400">Aizsardzība</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Omniva/DPD</div>
                <div className="text-sm text-slate-400">Piegāde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}