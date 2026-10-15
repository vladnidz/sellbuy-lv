import { prisma } from '../app/lib/prisma';

interface TaxonomyNode {
  path: string;
  name: string;
  nameLv: string;
  nameRu: string;
  nameEn: string;
  nameUk: string;
  attributes?: Record<string, unknown>;
  children?: TaxonomyNode[];
}

export const DEEP_CATALOG_DATA: TaxonomyNode[] = [
  {
    path: 'transports',
    name: 'Transports',
    nameLv: 'Transports',
    nameRu: 'Транспорт',
    nameEn: 'Transport',
    nameUk: 'Транспорт',
    children: [
      {
        path: 'transports.vieglie_auto',
        name: 'Vieglie auto',
        nameLv: 'Vieglie auto',
        nameRu: 'Легковые авто',
        nameEn: 'Passenger Cars',
        nameUk: 'Легкові автомобілі',
        attributes: {
          vin: { type: 'string', label: { lv: 'VIN kods', en: 'VIN Code', ru: 'VIN код', uk: 'VIN-код' }, required: true },
          vinVerified: { type: 'boolean', label: { lv: 'Pārbaudīts VIN', en: 'VIN Verified', ru: 'Проверен VIN', uk: 'Перевірений VIN' } },
          plateNumber: { type: 'string', label: { lv: 'Valsts numurs', en: 'License Plate', ru: 'Госномер', uk: 'Держномер' } },
          year: { type: 'number', label: { lv: 'Izlaiduma gads', en: 'Year', ru: 'Год выпуска', uk: 'Рік випуску' }, required: true },
          mileage: { type: 'number', label: { lv: 'Nobraukums, km', en: 'Mileage, km', ru: 'Пробег, км', uk: 'Пробіг, км' }, required: true },
          engineVolume: { type: 'number', label: { lv: 'Motora tilpums, l', en: 'Engine, L', ru: 'Объем двигателя, л', uk: "Об'єм двигуна, л" } },
          fuelType: {
            type: 'enum',
            options: ['petrol', 'diesel', 'electric', 'hybrid', 'lpg'],
            label: { lv: 'Degvielas veids', en: 'Fuel Type', ru: 'Тип топлива', uk: 'Тип палива' },
            required: true,
          },
          transmission: {
            type: 'enum',
            options: ['manual', 'automatic'],
            label: { lv: 'Ātrumkārba', en: 'Gearbox', ru: 'КПП', uk: 'Коробка передач' },
            required: true,
          },
          bodyType: {
            type: 'enum',
            options: ['sedan', 'wagon', 'suv', 'hatchback', 'coupe', 'cabriolet', 'minivan'],
            label: { lv: 'Virsbūves tips', en: 'Body Type', ru: 'Тип кузова', uk: 'Тип кузова' },
          },
        },
        children: [
          {
            path: 'transports.vieglie_auto.bmw',
            name: 'BMW',
            nameLv: 'BMW',
            nameRu: 'BMW',
            nameEn: 'BMW',
            nameUk: 'BMW',
            children: [
              { path: 'transports.vieglie_auto.bmw.3_series', name: '3-Series', nameLv: '3. sērija', nameRu: '3-я серия', nameEn: '3 Series', nameUk: '3 Серія' },
              { path: 'transports.vieglie_auto.bmw.5_series', name: '5-Series', nameLv: '5. sērija', nameRu: '5-я серия', nameEn: '5 Series', nameUk: '5 Серія' },
              { path: 'transports.vieglie_auto.bmw.x5', name: 'X5', nameLv: 'X5', nameRu: 'X5', nameEn: 'X5', nameUk: 'X5' },
            ],
          },
          {
            path: 'transports.vieglie_auto.audi',
            name: 'Audi',
            nameLv: 'Audi',
            nameRu: 'Audi',
            nameEn: 'Audi',
            nameUk: 'Audi',
            children: [
              { path: 'transports.vieglie_auto.audi.a4', name: 'A4', nameLv: 'A4', nameRu: 'A4', nameEn: 'A4', nameUk: 'A4' },
              { path: 'transports.vieglie_auto.audi.a6', name: 'A6', nameLv: 'A6', nameRu: 'A6', nameEn: 'A6', nameUk: 'A6' },
              { path: 'transports.vieglie_auto.audi.q7', name: 'Q7', nameLv: 'Q7', nameRu: 'Q7', nameEn: 'Q7', nameUk: 'Q7' },
            ],
          },
          {
            path: 'transports.vieglie_auto.volkswagen',
            name: 'Volkswagen',
            nameLv: 'Volkswagen',
            nameRu: 'Volkswagen',
            nameEn: 'Volkswagen',
            nameUk: 'Volkswagen',
            children: [
              { path: 'transports.vieglie_auto.volkswagen.golf', name: 'Golf', nameLv: 'Golf', nameRu: 'Golf', nameEn: 'Golf', nameUk: 'Golf' },
              { path: 'transports.vieglie_auto.volkswagen.passat', name: 'Passat', nameLv: 'Passat', nameRu: 'Passat', nameEn: 'Passat', nameUk: 'Passat' },
              { path: 'transports.vieglie_auto.volkswagen.tiguan', name: 'Tiguan', nameLv: 'Tiguan', nameRu: 'Tiguan', nameEn: 'Tiguan', nameUk: 'Tiguan' },
            ],
          },
        ],
      },
      {
        path: 'transports.motocikli',
        name: 'Motocikli un motorolleri',
        nameLv: 'Motocikli un motorolleri',
        nameRu: 'Мотоциклы и скутеры',
        nameEn: 'Motorcycles & Scooters',
        nameUk: 'Мотоцикли та скутери',
      },
    ],
  },
  {
    path: 'nekustamie_ipasumi',
    name: 'Nekustamie īpašumi',
    nameLv: 'Nekustamie īpašumi',
    nameRu: 'Недвижимость',
    nameEn: 'Real Estate',
    nameUk: 'Нерухомість',
    children: [
      {
        path: 'nekustamie_ipasumi.dzivokli',
        name: 'Dzīvokļi',
        nameLv: 'Dzīvokļi',
        nameRu: 'Квартиры',
        nameEn: 'Apartments',
        nameUk: 'Квартири',
        attributes: {
          rooms: { type: 'number', label: { lv: 'Istabu skaits', en: 'Rooms', ru: 'Количество комнат', uk: 'Кількість кімнат' }, required: true },
          area: { type: 'number', label: { lv: 'Platība, m²', en: 'Area, m²', ru: 'Площадь, м²', uk: 'Площа, м²' }, required: true },
          floor: { type: 'number', label: { lv: 'Stāvs', en: 'Floor', ru: 'Этаж', uk: 'Поверх' } },
          totalFloors: { type: 'number', label: { lv: 'Stāvu skaits', en: 'Total Floors', ru: 'Всего этажей', uk: 'Всього поверхів' } },
          series: {
            type: 'enum',
            options: ['103', '104', '119', '602', 'jaunais', 'pirmskara', 'stalina', 'hiruscova'],
            label: { lv: 'Sērija', en: 'Building Series', ru: 'Серия дома', uk: 'Серія будинку' },
          },
        },
      },
      {
        path: 'nekustamie_ipasumi.majas',
        name: 'Mājas un vasarnīcas',
        nameLv: 'Mājas un vasarnīcas',
        nameRu: 'Дома и дачи',
        nameEn: 'Houses & Cottages',
        nameUk: 'Будинки та дачі',
      },
    ],
  },
  {
    path: 'elektronika',
    name: 'Elektronika',
    nameLv: 'Elektronika',
    nameRu: 'Электроника',
    nameEn: 'Electronics',
    nameUk: 'Електроніка',
    children: [
      {
        path: 'elektronika.telefoni',
        name: 'Telefoni un sakari',
        nameLv: 'Telefoni un sakari',
        nameRu: 'Телефоны и связь',
        nameEn: 'Phones & Telecom',
        nameUk: "Телефони та зв'язок",
        children: [
          {
            path: 'elektronika.telefoni.apple',
            name: 'Apple iPhone',
            nameLv: 'Apple iPhone',
            nameRu: 'Apple iPhone',
            nameEn: 'Apple iPhone',
            nameUk: 'Apple iPhone',
            children: [
              { path: 'elektronika.telefoni.apple.iphone_15', name: 'iPhone 15 Series', nameLv: 'iPhone 15 sērija', nameRu: 'Серия iPhone 15', nameEn: 'iPhone 15 Series', nameUk: 'Серія iPhone 15' },
              { path: 'elektronika.telefoni.apple.iphone_16', name: 'iPhone 16 Series', nameLv: 'iPhone 16 sērija', nameRu: 'Серия iPhone 16', nameEn: 'iPhone 16 Series', nameUk: 'Серія iPhone 16' },
            ],
          },
          {
            path: 'elektronika.telefoni.samsung',
            name: 'Samsung Galaxy',
            nameLv: 'Samsung Galaxy',
            nameRu: 'Samsung Galaxy',
            nameEn: 'Samsung Galaxy',
            nameUk: 'Samsung Galaxy',
          },
        ],
      },
      {
        path: 'elektronika.datori',
        name: 'Datori un portatīvie datori',
        nameLv: 'Datori un portatīvie datori',
        nameRu: 'Компьютеры и ноутбуки',
        nameEn: 'Computers & Laptops',
        nameUk: "Комп'ютери та ноутбуки",
      },
    ],
  },
];

async function seedNode(node: TaxonomyNode, parentId: string | null = null) {
  // Upsert category using raw SQL to support ltree path casting cleanly
  const res = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "Category" ("id", "name", "nameLv", "nameRu", "nameEn", "nameUk", "path", "parentId", "attributes")
    VALUES (
      gen_random_uuid()::text,
      ${node.name},
      ${node.nameLv},
      ${node.nameRu},
      ${node.nameEn},
      ${node.nameUk},
      ${node.path}::ltree,
      ${parentId},
      ${node.attributes ? JSON.stringify(node.attributes) : null}::jsonb
    )
    ON CONFLICT ("path") DO UPDATE SET
      "name" = EXCLUDED."name",
      "nameLv" = EXCLUDED."nameLv",
      "nameRu" = EXCLUDED."nameRu",
      "nameEn" = EXCLUDED."nameEn",
      "nameUk" = EXCLUDED."nameUk",
      "attributes" = COALESCE(EXCLUDED."attributes", "Category"."attributes")
    RETURNING "id";
  `;

  const categoryId = res[0]?.id;

  if (node.children && node.children.length > 0 && categoryId) {
    for (const child of node.children) {
      await seedNode(child, categoryId);
    }
  }
}

export async function runDeepTaxonomySeed() {
  console.log('Seeding deep hierarchical taxonomy (up to 4 levels)...');
  for (const root of DEEP_CATALOG_DATA) {
    await seedNode(root, null);
  }
  console.log('Deep hierarchical taxonomy seeded successfully!');
}

if (require.main === module) {
  runDeepTaxonomySeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
