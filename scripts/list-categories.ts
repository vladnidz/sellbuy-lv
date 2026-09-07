import { prisma } from '../app/lib/prisma';

async function main() {
  const categories = await prisma.category.findMany();
  console.log(JSON.stringify(categories, null, 2));
}

main();
