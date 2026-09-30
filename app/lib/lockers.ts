export type LockerProvider = 'omniva' | 'dpd' | 'pasts';

export interface LockerOption {
  id: string;
  provider: LockerProvider;
  name: string;
  city: string;
  address: string;
}

export const LATVIAN_LOCKERS: LockerOption[] = [
  // Omniva
  { id: 'omniva-1', provider: 'omniva', name: 'Rīgas Akropole Alfa pakomāts', city: 'Rīga', address: 'Brīvības gatve 372' },
  { id: 'omniva-2', provider: 'omniva', name: 'Rīgas t/c Origo pakomāts', city: 'Rīga', address: 'Stacijas laukums 4' },
  { id: 'omniva-3', provider: 'omniva', name: 'Liepājas t/c Rietumu Centrs pakomāts', city: 'Liepāja', address: 'Jaunā ostmala 3/5' },
  { id: 'omniva-4', provider: 'omniva', name: 'Daugavpils t/c Ditton Nams pakomāts', city: 'Daugavpils', address: 'Cietokšņa iela 60' },
  { id: 'omniva-5', provider: 'omniva', name: 'Jelgavas t/c Pilsētas Pasāža pakomāts', city: 'Jelgava', address: 'Driksas iela 4' },
  { id: 'omniva-6', provider: 'omniva', name: 'Valmieras t/c Valleta pakomāts', city: 'Valmiera', address: 'Rīgas iela 4' },

  // DPD Pickup Network
  { id: 'dpd-1', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rīga Spice', city: 'Rīga', address: 'Lielirbes iela 29' },
  { id: 'dpd-2', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rīga Domina', city: 'Rīga', address: 'Ieriķu iela 3' },
  { id: 'dpd-3', provider: 'dpd', name: 'DPD Pickup Paku Skapis Ventspils', city: 'Ventspils', address: 'Lielais prospekts 3/5' },
  { id: 'dpd-4', provider: 'dpd', name: 'DPD Pickup Paku Skapis Rēzekne', city: 'Rēzekne', address: 'Atbrīvošanas aleja 141' },

  // Latvijas Pasts
  { id: 'pasts-1', provider: 'pasts', name: 'Latvijas Pasts Pakomāts Rīga Mols', city: 'Rīga', address: 'Krasta iela 46' },
  { id: 'pasts-2', provider: 'pasts', name: 'Latvijas Pasts Pakomāts Jūrmala Kauguri', city: 'Jūrmala', address: 'Talsu šoseja 31' },
];
