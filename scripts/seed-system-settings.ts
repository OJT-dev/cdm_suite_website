
/**
 * Seed System Settings
 * 
 * This script seeds the database with default system settings
 * for contact information and other global configuration.
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('[Seed System Settings] Starting...');

  const defaultSettings = [
    {
      settingKey: 'default_contact_email',
      settingValue: 'contracts@cdmsuite.com',
      description: 'Email address used in all bid proposals and contracts',
    },
    {
      settingKey: 'default_contact_phone',
      settingValue: '(862) 272-7623',
      description: 'Phone number used in all bid proposals and contracts',
    },
    {
      settingKey: 'default_signees',
      settingValue: 'Fray, Everoy',
      description: 'Authorized signees for contracts (comma-separated)',
    },
  ];

  for (const setting of defaultSettings) {
    const result = await db.systemSettings.upsert({
      where: { settingKey: setting.settingKey },
      update: {
        // Only update description if it changed, preserve existing value
        description: setting.description,
      },
      create: setting,
    });

    console.log(
      `[Seed System Settings] ✓ ${setting.settingKey}: ${result.settingValue}`
    );
  }

  console.log('[Seed System Settings] Complete!');
}

main()
  .catch((error) => {
    console.error('[Seed System Settings] Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
