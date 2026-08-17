import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rootCategories = [
    { name: 'Transports', path: 'transports' },
    { name: 'Nekustamie īpašumi', path: 'nekustamie_ipasumi' },
    { name: 'Elektronika & Sadzīves tehnika', path: 'elektronika_sadzives_tehnika' },
    { name: 'Celtniecība & Remonts', path: 'celtnieciba_remonts' },
    { name: 'Darbs & Bizness', path: 'darbs_bizness' },
    { name: 'Māja & Dārzs', path: 'maja_darzs' },
    { name: 'Apģērbi & Aksesuāri', path: 'apgerbi_aksesuari' },
    { name: 'Bērnu pasaule', path: 'bernu_pasaule' },
    { name: 'Lauksaimniecība', path: 'lauksaimnieciba' },
    { name: 'Dzīvnieki & Zoo', path: 'dzivnieki_zoo' },
    { name: 'Hobiji & Atpūta', path: 'hobiji_atputa' },
  ];

  for (const cat of rootCategories) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Category" (id, name, path) VALUES (gen_random_uuid(), '${cat.name}', '${cat.path}'::ltree) ON CONFLICT DO NOTHING`
    );
  }

  console.log('Seeded root categories');
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
