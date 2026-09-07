import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '<set>' : '<not set>');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * SellBuy.lv category tree seed matching SellBuy-lv-Category-Taxonomy.md
 *
 * Categories:
 * 1. Cars - Brand (enum), Year (number), Mileage (number)
 * 2. Real Estate - Type (enum), Rooms (number), Area (number)
 * 3. Phones - Brand (enum), Storage (number)
 * 4. Fashion - Gender (enum), Size (string)
 * 5. Animals - Species (enum), Age (number)
 * 6. Jobs - Category (enum), Salary (number)
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

const tree: SeedNode[] = [
  {
    lv: 'Automobiļi',
    ru: 'Автомобили',
    en: 'Cars',
    attributes: {
      brand: {
        type: 'enum',
        label: { lv: 'Marka', ru: 'Марка', en: 'Brand' },
        options: ['Audi', 'BMW', 'VW'],
        required: true,
      },
      year: {
        type: 'number',
        label: { lv: 'Izlaiduma gads', ru: 'Год выпуска', en: 'Year' },
        required: true,
      },
      mileage: {
        type: 'number',
        label: { lv: 'Nobraukums, km', ru: 'Пробег, км', en: 'Mileage' },
      },
    },
  },
  {
    lv: 'Nekustamie īpašumi',
    ru: 'Недвижимость',
    en: 'Real Estate',
    attributes: {
      type: {
        type: 'enum',
        label: { lv: 'Tips', ru: 'Тип', en: 'Type' },
        options: ['apartment', 'house', 'land'],
        required: true,
      },
      rooms: {
        type: 'number',
        label: { lv: 'Istabu skaits', ru: 'Количество комнат', en: 'Rooms' },
      },
      area: {
        type: 'number',
        label: { lv: 'Platība, m²', ru: 'Площадь, м²', en: 'Area' },
        required: true,
      },
    },
  },
  {
    lv: 'Telefoni',
    ru: 'Телефоны',
    en: 'Phones',
    attributes: {
      brand: {
        type: 'enum',
        label: { lv: 'Ražotājs', ru: 'Производитель', en: 'Brand' },
        options: ['Apple', 'Samsung', 'Xiaomi'],
        required: true,
      },
      storage: {
        type: 'number',
        label: { lv: 'Atmiņa, GB', ru: 'Память, ГБ', en: 'Storage' },
      },
    },
  },
  {
    lv: 'Mode un stils',
    ru: 'Мода и стиль',
    en: 'Fashion',
    attributes: {
      gender: {
        type: 'enum',
        label: { lv: 'Dzimums', ru: 'Пол', en: 'Gender' },
        options: ['men', 'women', 'unisex'],
        required: true,
      },
      size: {
        type: 'string',
        label: { lv: 'Izmērs', ru: 'Размер', en: 'Size' },
      },
    },
  },
  {
    lv: 'Dzīvnieki',
    ru: 'Животные',
    en: 'Animals',
    attributes: {
      species: {
        type: 'enum',
        label: { lv: 'Suga', ru: 'Вид', en: 'Species' },
        options: ['dog', 'cat', 'other'],
        required: true,
      },
      age: {
        type: 'number',
        label: { lv: 'Vecums, gadi', ru: 'Возраст, годы', en: 'Age' },
      },
    },
  },
  {
    lv: 'Darbs',
    ru: 'Работа',
    en: 'Jobs',
    attributes: {
      category: {
        type: 'enum',
        label: { lv: 'Kategorija', ru: 'Категория', en: 'Category' },
        options: ['IT', 'construction', 'service'],
        required: true,
      },
      salary: {
        type: 'number',
        label: { lv: 'Alga', ru: 'Зарплата', en: 'Salary' },
      },
    },
  },
];

/** Sanitize a name into a valid ltree label (a-z0-9_, no leading digit issues handled by prefixing when needed). */
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
        SELECT "id" FROM "Category" WHERE "path" = ${path}::ltree
      `
    )[0].id;

  if (node.children) {
    for (const child of node.children) {
      await insertNode(child, id, path);
    }
  }
}

async function main() {
  console.log('Seeding category taxonomy from SellBuy-lv-Category-Taxonomy.md...');
  for (const node of tree) {
    await insertNode(node, null, null);
  }

  // Verify
  const count = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM "Category"
  `;
  console.log(`Seeded ${count[0].count} categories (trilingual names + attribute schemas).`);
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