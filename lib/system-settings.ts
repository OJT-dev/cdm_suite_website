
/**
 * System Settings Utilities
 * 
 * Provides functions to fetch and manage system-wide settings
 * with fallback to default values from the knowledge base.
 */

import { prisma } from './db';
import { CDM_SUITE_KNOWLEDGE } from './cdm-suite-knowledge';

/**
 * Fetch a specific setting value from database or fallback to default
 */
export async function getSettingValue(
  settingKey: string,
  defaultValue: string
): Promise<string> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { settingKey },
    });

    return setting?.settingValue || defaultValue;
  } catch (error) {
    console.error(`[System Settings] Error fetching ${settingKey}:`, error);
    return defaultValue;
  }
}

/**
 * Fetch multiple settings in one database call
 */
export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        settingKey: {
          in: keys,
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((setting: any) => {
      settingsMap[setting.settingKey] = setting.settingValue;
    });

    return settingsMap;
  } catch (error) {
    console.error('[System Settings] Error fetching multiple settings:', error);
    return {};
  }
}

/**
 * Get default contact information with database override support
 * 
 * This function checks the database for system settings first,
 * and falls back to hardcoded defaults from the knowledge base.
 */
export async function getDefaultContactInfo(): Promise<{
  email: string;
  phone: string;
  signees: string[];
}> {
  try {
    const settings = await getSettings([
      'default_contact_email',
      'default_contact_phone',
      'default_signees',
    ]);

    // Use database values if available, otherwise use defaults from knowledge base
    const { company } = CDM_SUITE_KNOWLEDGE;
    
    return {
      email: settings.default_contact_email || company.contactEmail,
      phone: settings.default_contact_phone || company.contactPhone,
      signees: settings.default_signees 
        ? settings.default_signees.split(',').map(s => s.trim())
        : company.authorizedSignees,
    };
  } catch (error) {
    console.error('[System Settings] Error fetching contact info:', error);
    
    // Fallback to knowledge base defaults
    const { company } = CDM_SUITE_KNOWLEDGE;
    return {
      email: company.contactEmail,
      phone: company.contactPhone,
      signees: company.authorizedSignees,
    };
  }
}

/**
 * Seed default settings in database if they don't exist
 * 
 * This should be called on app initialization or migration
 */
export async function seedDefaultSettings(): Promise<void> {
  try {
    const { company } = CDM_SUITE_KNOWLEDGE;

    const defaultSettings = [
      {
        settingKey: 'default_contact_email',
        settingValue: company.contactEmail,
        description: 'Email address used in all bid proposals and contracts',
      },
      {
        settingKey: 'default_contact_phone',
        settingValue: company.contactPhone,
        description: 'Phone number used in all bid proposals and contracts',
      },
      {
        settingKey: 'default_signees',
        settingValue: company.authorizedSignees.join(', '),
        description: 'Authorized signees for contracts',
      },
    ];

    for (const setting of defaultSettings) {
      await prisma.systemSettings.upsert({
        where: { settingKey: setting.settingKey },
        update: {},
        create: setting,
      });
    }

    console.log('[System Settings] Default settings seeded successfully');
  } catch (error) {
    console.error('[System Settings] Error seeding default settings:', error);
  }
}
