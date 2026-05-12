import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'maarijwaseem7@gmail.com';
  const adminPassword = '123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  console.log('Seeding admin user...');

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      subscriptionStatus: 'ACTIVE',
      subscriptionTier: 'PREMIUM',
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      credits: 9999,
      role: 'ADMIN',
      subscriptionStatus: 'ACTIVE',
      subscriptionTier: 'PREMIUM',
    },
  });

  console.log('Admin user seeded:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
