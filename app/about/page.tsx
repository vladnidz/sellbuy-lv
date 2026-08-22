import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Shield, Truck, Smartphone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sākumlapu
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Par SellBuy.lv
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Moderns, drošs un ātrs sludinājumu portāls, kas maina to, kā latvieši pērk un pārdod.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Shield,
              title: 'Droši darījumi',
              description: 'Smart-ID identitātes pārbaude un escrow sistēma aizsargā abas puses. Nauda tiek nodrošināta tikai pēc veiksmīgas piegādes.',
            },
            {
              icon: Truck,
              title: 'Omniva & DPD integrācija',
              description: 'Automatizēta nosūtīšana ar sekošanas numuriem. Piegāde visā Latvijā un ārzemēs ar uzticamiem partneriem.',
            },
            {
              icon: Smartphone,
              title: 'AI-native meklēšana',
              description: 'Vectora meklēšana ar semantisko ponāšanu atrod tieši to, ko meklējat, nevis tikai atslēgvārdus.',
            },
          ].map((feature, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-800 h-full">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-400 mb-3" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="bg-slate-900/50 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Kā tas darbojas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Izveido sludinājumu', desc: 'Aizpildi vienkāršu formu ar fotēm, cenu un aprakstu. Publicēšana nemazgā vietu.' },
                { step: '2', title: 'Saņem piedāvājumus', desc: 'Interesenti raksta ziņas caum drošo čatu. Tu redzi viņu verifikācijas statusu.' },
                { step: '3', title: 'Veic drošu darījumu', desc: 'Piekrīt piedāvājumam. Nauda aiziet escrow kontā. Nosūti preci ar Omniva/DPD.' },
                { step: '4', title: 'Saņem naudu', desc: 'Pēc piegādes un apstiprinājuma no abām pusēm, nauda tiek automātiski pārskaitīta tev.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust badges */}
        <Card className="bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-center text-blue-400 mb-6">Mēs esam uzbūvēti uz uzticēšanās</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-400">100%</div>
                <div className="text-sm text-slate-300">Verificēti lietotāji</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-400">€0</div>
                <div className="text-sm text-slate-300">Sludinājumu izmaksas</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-slate-300">Atbalsts</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-400">1000+</div>
                <div className="text-sm text-slate-300">Veiksmīgi darījumi</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/new-listing">
            <Button size="lg" className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-lg">
              Sākt pārdot tagad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}