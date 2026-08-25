import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * SellBuy.lv category tree seed.
 *
 * Every node carries trilingual names (lv / ru / en) and an optional JSONB
 * `attributes` schema describing the extra fields listings in that category
 * expose to sellers:
 *
 *   field: {
 *     type: 'string' | 'number' | 'enum' | 'boolean',
 *     label: { lv, ru, en },
 *     options?: string[],   // for enums
 *     required?: boolean,
 *   }
 */
type SeedLabel = Record<'lv' | 'ru' | 'en', string>;

type AttributeField = {
  type: 'string' | 'number' | 'enum' | 'boolean';
  label: SeedLabel;
  options?: string[];
  required?: boolean;
};

type SeedNode = {
  lv: string;
  ru: string;
  en: string;
  attributes?: Record<string, AttributeField>;
  children?: SeedNode[];
};

const priceField: AttributeField = {
  type: 'number',
  label: { lv: 'Cena', ru: 'Цена', en: 'Price' },
  required: true,
};

const tree: SeedNode[] = [
  {
    lv: 'Transports',
    ru: 'Транспорт',
    en: 'Transport',
    attributes: {
      make: { type: 'string', label: { lv: 'Marka', ru: 'Марка', en: 'Make' } },
    },
    children: [
      {
        lv: 'Automobīli',
        ru: 'Легковые автомобили',
        en: 'Cars',
        attributes: {
          year: { type: 'number', label: { lv: 'Izlaiduma gads', ru: 'Год выпуска', en: 'Year of manufacture' }, required: true },
          mileageKm: { type: 'number', label: { lv: 'Nobraukums, km', ru: 'Пробег, км', en: 'Mileage, km' } },
          fuel: {
            type: 'enum',
            label: { lv: 'Degviela', ru: 'Топливо', en: 'Fuel' },
            options: ['petrol', 'diesel', 'gas', 'hybrid', 'electric'],
          },
          transmission: {
            type: 'enum',
            label: { lv: 'Ātrumkārba', ru: 'КПП', en: 'Transmission' },
            options: ['manual', 'automatic'],
          },
        },
        children: [
          { lv: 'Sedani', ru: 'Седаны', en: 'Sedans' },
          { lv: 'Apvidus auto', ru: 'Внедорожники', en: 'SUVs' },
          { lv: 'Furgoni', ru: 'Фургоны', en: 'Vans' },
        ],
      },
      {
        lv: 'Motocikli',
        ru: 'Мотоциклы',
        en: 'Motorcycles',
        attributes: {
          engineCc: { type: 'number', label: { lv: 'Motora tilpums, cm³', ru: 'Объём двигателя, см³', en: 'Engine size, cc' } },
        },
      },
      { lv: 'Piekabes', ru: 'Прицепы', en: 'Trailers' },
      { lv: 'Velosipēdi', ru: 'Велосипеды', en: 'Bicycles' },
    ],
  },
  {
    lv: 'Nekustamie īpašumi',
    ru: 'Недвижимость',
    en: 'Real estate',
    attributes: {
      areaM2: { type: 'number', label: { lv: 'Platība, m²', ru: 'Площадь, м²', en: 'Area, m²' }, required: true },
      rooms: { type: 'number', label: { lv: 'Istaban skaits', ru: 'Количество комнат', en: 'Number of rooms' } },
    },
    children: [
      {
        lv: 'Pārdod',
        ru: 'Продажа',
        en: 'For sale',
        children: [
          { lv: 'Dzīvokļi', ru: 'Квартиры', en: 'Apartments' },
          { lv: 'Mājas', ru: 'Дома', en: 'Houses' },
          { lv: 'Zeme', ru: 'Земля', en: 'Land' },
        ],
      },
      {
        lv: 'Izīrē',
        ru: 'Аренда',
        en: 'For rent',
        children: [
          { lv: 'Dzīvokļi', ru: 'Квартиры', en: 'Apartments' },
          { lv: 'Biroji', ru: 'Офисы', en: 'Offices' },
        ],
      },
    ],
  },
  {
    lv: 'Elektronika un sadzīves tehnika',
    ru: 'Электроника и бытовая техника',
    en: 'Electronics & Home Appliances',
    children: [
      {
        lv: 'Viedtālruņi',
        ru: 'Смартфоны',
        en: 'Smartphones',
        attributes: {
          brand: { type: 'string', label: { lv: 'Ražotājs', ru: 'Производитель', en: 'Brand' }, required: true },
          storageGb: { type: 'number', label: { lv: 'Atmiņa, GB', ru: 'Память, ГБ', en: 'Storage, GB' } },
        },
      },
      { lv: 'Datoris', ru: 'Компьютеры', en: 'Computers' },
      { lv: 'Televizori', ru: 'Телевизоры', en: 'TVs' },
      { lv: 'Sadzīves tehnika', ru: 'Бытовая техника', en: 'Home appliances' },
    ],
  },
  { lv: 'Celtniecība un materiāli', ru: 'Стройматериалы', en: 'Construction & Materials' },
  { lv: 'Mājai un dārzam', ru: 'Для дома и сада', en: 'Home & Garden' },
  { lv: 'Apģērbs un stils', ru: 'Одежда и стиль', en: 'Clothing & Style' },
  { lv: 'Bērnu pasaule', ru: 'Детский мир', en: "Children's World" },
  { lv: 'Sports un atpūta', ru: 'Спорт и отдых', en: 'Sports & Leisure' },
];

/** Sanitize a name into a valid ltree label (a-z0-9_, no leading digit issues
 *  handled by prefixing when needed). */
function ltreeLabel(name: string): string {
  let label = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (/^[0-9]/.test(label)) {
    label = `c_${label}`;
  }
  return label || 'cat';
}

async function insertNode(
  node: SeedNode,
  parentId: string | null,
  parentPath: string | null
): Promise<void> {
  const label = ltreeLabel(node.lv);
  const path = parentPath ? `${parentPath}.${label}` : label;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "Category" ("id", "name", "nameLv", "nameRu", "nameEn", "attributes", "path", "parentId")
    VALUES (
      gen_random_uuid()::text,
      ${node.lv},
      ${node.lv},
      ${node.ru},
      ${node.en},
      ${node.attributes ? JSON.stringify(node.attributes) : null}::jsonb,
      ${path}::ltree,
      ${parentId}
    )
    ON CONFLICT DO NOTHING
    RETURNING "id"
  `;

  // ON CONFLICT DO NOTHING may skip the row if path already exists — reuse it.
  const id =
    rows[0]?.id ??
    (
      await prisma.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "Category" WHERE "path" = ${path}::ltree LIMIT 1
      `
    )[0].id;

  for (const child of node.children ?? []) {
    await insertNode(child, id, path);
  }
}

async function resetTables(): Promise<void> {
  // Destructive reset is opt-in via SEED_RESET=true so production/repeated
  // runs are idempotent-safe by default. The statement is a constant (no
  // interpolation) so we use the tagged $executeRaw form — never $executeRawUnsafe.
  if (process.env.SEED_RESET !== 'true') {
    console.log('[seed] SEED_RESET != true; skipping TRUNCATE (idempotent upserts only).');
    return;
  }
  await prisma.$executeRaw`TRUNCATE TABLE "Listing", "Category" RESTART IDENTITY CASCADE`;
}

async function main() {
  await resetTables();

  for (const node of tree) {
    await insertNode(node, null, null);
  }

  const [{ count }] = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM "Category"
  `;
  console.log(`Seeded ${count} categories (trilingual names + attribute schemas).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
