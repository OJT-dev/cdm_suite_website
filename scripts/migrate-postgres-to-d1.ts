
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PG_CONNECTION_STRING = process.env.PG_DATABASE_URL;

if (!PG_CONNECTION_STRING) {
    console.error('❌ PG_DATABASE_URL is not defined in .env');
    process.exit(1);
}

// List of tables to migrate in order (to respect dependencies if possible, though we'll disable FK checks)
const TABLES = [
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'password_reset_tokens',
    'contact_submissions',
    'orders',
    'services',
    'leads',
    'employees',
    'projects',
    'blog_posts',
    'marketing_assessments',
    'website_audits',
    'referrals',
    'assistant_conversations',
    'business_contexts',
    'proposals',
    'lead_activities',
    'lead_sequences',
    'chat_conversations',
    'subscriptions',
    'project_tasks',
    'project_files',
    'time_logs',
    'sequences',
    'sequence_steps',
    'sequence_assignments',
    'sequence_activities',
    'messages',
    'ai_recommendations',
    'workflow_templates'
];

async function migrate() {
    console.log('🚀 Starting migration from Postgres to D1 SQL...');

    const client = new Client({
        connectionString: PG_CONNECTION_STRING,
        ssl: { rejectUnauthorized: false } // Required for many hosted Postgres instances
    });

    try {
        await client.connect();
        console.log('✅ Connected to Postgres');

        let sqlOutput = '-- Migration from Postgres to D1\n';
        sqlOutput += 'PRAGMA foreign_keys = OFF;\n';
        sqlOutput += 'BEGIN TRANSACTION;\n\n';

        for (const table of TABLES) {
            console.log(`Processing table: ${table}...`);

            try {
                const res = await client.query(`SELECT * FROM "${table}"`);
                const rows = res.rows;

                if (rows.length === 0) {
                    console.log(`   No data in ${table}`);
                    continue;
                }

                console.log(`   Found ${rows.length} rows`);

                for (const row of rows) {
                    const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';

                        if (typeof val === 'boolean') {
                            return val ? '1' : '0'; // SQLite boolean
                        }

                        if (val instanceof Date) {
                            return `'${val.toISOString()}'`;
                        }

                        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
                            // Convert Arrays and Objects (JSON) to string
                            // Escape single quotes in the JSON string
                            const jsonStr = JSON.stringify(val);
                            return `'${jsonStr.replace(/'/g, "''")}'`;
                        }

                        if (typeof val === 'string') {
                            // Escape single quotes
                            return `'${val.replace(/'/g, "''")}'`;
                        }

                        return val; // Numbers
                    }).join(', ');

                    sqlOutput += `INSERT INTO "${table}" (${columns}) VALUES (${values});\n`;
                }
                sqlOutput += '\n';
            } catch (err: any) {
                if (err.code === '42P01') {
                    console.warn(`⚠️ Table ${table} does not exist in source DB. Skipping.`);
                } else {
                    console.error(`❌ Error reading table ${table}:`, err);
                }
            }
        }

        sqlOutput += 'COMMIT;\n';
        sqlOutput += 'PRAGMA foreign_keys = ON;\n';

        const outputPath = path.join(process.cwd(), 'migration.sql');
        fs.writeFileSync(outputPath, sqlOutput);

        console.log(`\n✅ Migration SQL generated at: ${outputPath}`);
        console.log(`\nTo apply to D1, run:`);
        console.log(`npx wrangler d1 execute cdm-suite-db --file=migration.sql --remote`);

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
