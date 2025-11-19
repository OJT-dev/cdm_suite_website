
import fs from 'fs';
import path from 'path';

const INPUT_FILE = 'data_dump.json';
const OUTPUT_FILE = 'migration.sql';

// Map JSON keys (potentially camelCase) to D1 table names (snake_case)
const TABLE_MAPPING: Record<string, string> = {
    'users': 'users',
    'accounts': 'accounts',
    'sessions': 'sessions',
    'verificationTokens': 'verification_tokens',
    'passwordResetTokens': 'password_reset_tokens',
    'contactSubmissions': 'contact_submissions',
    'orders': 'orders',
    'services': 'services',
    'leads': 'leads',
    'employees': 'employees',
    'projects': 'projects',
    'blogPosts': 'blog_posts',
    'marketingAssessments': 'marketing_assessments',
    'websiteAudits': 'website_audits',
    'referrals': 'referrals',
    'assistantConversations': 'assistant_conversations',
    'businessContexts': 'business_contexts',
    'proposals': 'proposals',
    'leadActivities': 'lead_activities',
    'leadSequences': 'lead_sequences',
    'chatConversations': 'chat_conversations',
    'subscriptions': 'subscriptions',
    'projectTasks': 'project_tasks',
    'projectFiles': 'project_files',
    'timeLogs': 'time_logs',
    'sequences': 'sequences',
    'sequenceSteps': 'sequence_steps',
    'sequenceAssignments': 'sequence_assignments',
    'sequenceActivities': 'sequence_activities',
    'messages': 'messages',
    'aiRecommendations': 'ai_recommendations',
    'workflowTemplates': 'workflow_templates',

    // Add snake_case variants just in case the dump uses them
    'verification_tokens': 'verification_tokens',
    'password_reset_tokens': 'password_reset_tokens',
    'contact_submissions': 'contact_submissions',
    'blog_posts': 'blog_posts',
    'marketing_assessments': 'marketing_assessments',
    'website_audits': 'website_audits',
    'assistant_conversations': 'assistant_conversations',
    'business_contexts': 'business_contexts',
    'lead_activities': 'lead_activities',
    'lead_sequences': 'lead_sequences',
    'chat_conversations': 'chat_conversations',
    'project_tasks': 'project_tasks',
    'project_files': 'project_files',
    'time_logs': 'time_logs',
    'sequence_steps': 'sequence_steps',
    'sequence_assignments': 'sequence_assignments',
    'sequence_activities': 'sequence_activities',
    'ai_recommendations': 'ai_recommendations',
    'workflow_templates': 'workflow_templates',
    'bidProposals': 'bid_proposals',
    'bidAttachments': 'bid_attachments',
    'systemSettings': 'system_settings'
};

function convert() {
    const inputPath = path.resolve(process.cwd(), INPUT_FILE);
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File not found: ${inputPath}`);
        process.exit(1);
    }

    console.log(`📖 Reading ${INPUT_FILE}...`);
    const rawData = fs.readFileSync(inputPath, 'utf-8');
    let data;
    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        process.exit(1);
    }

    let sql = '-- Migration SQL generated from data_dump.json\n';
    sql += 'PRAGMA foreign_keys = OFF;\n';
    // sql += 'BEGIN TRANSACTION;\n\n';

    let totalRows = 0;

    for (const [key, rows] of Object.entries(data)) {
        const tableName = TABLE_MAPPING[key] || key; // Fallback to key if not mapped

        if (!Array.isArray(rows)) {
            console.warn(`⚠️ Skipping key "${key}": value is not an array`);
            continue;
        }

        if (rows.length === 0) {
            console.log(`ℹ️  Skipping table "${tableName}": No data`);
            continue;
        }

        console.log(`Processing table "${tableName}" (${rows.length} rows)...`);
        totalRows += rows.length;

        for (const row of rows) {
            const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
            const values = Object.values(row).map(val => {
                if (val === null) return 'NULL';
                if (typeof val === 'number') return val;
                if (typeof val === 'boolean') return val ? 1 : 0; // SQLite boolean
                if (typeof val === 'object') {
                    // Arrays and Objects -> JSON string
                    const json = JSON.stringify(val);
                    return `'${json.replace(/'/g, "''")}'`;
                }
                // Strings
                return `'${String(val).replace(/'/g, "''")}'`;
            }).join(', ');

            sql += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
        }
        sql += '\n';
    }

    // sql += 'COMMIT;\n';
    sql += 'PRAGMA foreign_keys = ON;\n';

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`\n✅ Generated ${OUTPUT_FILE} with ${totalRows} rows.`);
    console.log(`\n🚀 To execute migration on D1:`);
    console.log(`npx wrangler d1 execute cdm-suite-db --file=migration.sql --remote`);
}

convert();
