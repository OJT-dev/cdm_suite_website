import { config } from 'dotenv';
config();

import { prisma } from '../lib/db';

async function main() {
  // Get all users and check their tier
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      tier: true
    }
  });
  
  console.log(`Found ${allUsers.length} total users`);
  
  // Count users by tier
  const tierCounts: Record<string, number> = {};
  allUsers.forEach((user: any) => {
    const tier = user.tier || 'null';
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  });
  
  console.log('Tier distribution:', tierCounts);
  
  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(console.error);
