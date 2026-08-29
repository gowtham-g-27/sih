const { createClient } = require('@libsql/client');
const path = require('path');

// Determine Database URL - use local file fallback for reliability if Turso URL fails or is offline
const cloudUrl = process.env.LIBSQL_URL;
const cloudAuthToken = process.env.LIBSQL_AUTH_TOKEN;
const localDbPath = path.join(__dirname, 'coopserve.db');

let db = createClient({
    url: cloudUrl || `file:${localDbPath}`,
    authToken: cloudAuthToken
});

async function initDb() {
    try {
        // Test connection
        try {
            await db.execute('SELECT 1');
        } catch (connErr) {
            console.warn('Primary DB connection failed, falling back to local SQLite coopserve.db:', connErr.message);
            db = createClient({ url: `file:${localDbPath}` });
        }

        // 1. Core Users Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                gender TEXT DEFAULT 'Male',
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Customer Profiles Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS customer_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                address TEXT,
                city TEXT,
                pin_code TEXT,
                profile_photo TEXT
            );
        `);

        // 3. Worker Profiles Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS worker_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                experience_years INTEGER DEFAULT 0,
                description TEXT,
                service_area TEXT,
                availability TEXT DEFAULT 'AVAILABLE',
                hourly_rate REAL DEFAULT 500,
                verification_status TEXT DEFAULT 'PENDING'
            );
        `);

        // 4. Skills Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            );
        `);

        // 5. Worker Skills Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS worker_skills (
                worker_id INTEGER,
                skill_id INTEGER,
                PRIMARY KEY (worker_id, skill_id)
            );
        `);

        // 6. Worker Documents Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS worker_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER NOT NULL,
                document_type TEXT NOT NULL,
                document_url TEXT NOT NULL,
                verification_status TEXT DEFAULT 'PENDING',
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 7. Worker Verifications Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS worker_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                verified_by INTEGER,
                verified_at DATETIME,
                rejection_reason TEXT
            );
        `);

        // 8. Services Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                base_price REAL NOT NULL
            );
        `);

        // 9. Service Requests Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS service_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                worker_id INTEGER,
                service_id INTEGER NOT NULL,
                description TEXT,
                location TEXT NOT NULL,
                status TEXT DEFAULT 'REQUESTED',
                price REAL NOT NULL,
                advance_paid REAL DEFAULT 0,
                balance_paid REAL DEFAULT 0,
                payment_status TEXT DEFAULT 'UNPAID',
                requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME
            );
        `);

        // Migration helper for existing table
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN advance_paid REAL DEFAULT 0"); } catch (_) {}
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN balance_paid REAL DEFAULT 0"); } catch (_) {}
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN payment_status TEXT DEFAULT 'UNPAID'"); } catch (_) {}

        // 10. Ratings Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                worker_id INTEGER NOT NULL,
                service_request_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                review TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 11. Real-Time Chat Messages Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_request_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 12. Payments & Transparent Wage Split Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_request_id INTEGER NOT NULL,
                customer_id INTEGER NOT NULL,
                worker_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                payment_type TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                transaction_id TEXT UNIQUE NOT NULL,
                worker_share REAL NOT NULL,
                society_welfare_share REAL NOT NULL,
                federation_share REAL NOT NULL,
                platform_fee REAL NOT NULL,
                status TEXT DEFAULT 'SUCCESS',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 13. Notifications Table (SMS & Push Hooks)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                channel TEXT NOT NULL,
                recipient_phone TEXT,
                status TEXT DEFAULT 'DELIVERED',
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 14. Complaints & Dispute Resolution Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS complaints_disputes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_request_id INTEGER,
                complainant_id INTEGER NOT NULL,
                respondent_id INTEGER,
                type TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'OPEN',
                resolution_notes TEXT,
                resolved_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME
            );
        `);

        // 15. Worker Welfare Claims & Healthcare Fund Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS welfare_claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER NOT NULL,
                claim_type TEXT NOT NULL,
                amount REAL NOT NULL,
                document_proof TEXT,
                description TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                reviewed_by INTEGER,
                reviewed_at DATETIME,
                disbursed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 16. SOS Emergency Alerts Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sos_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_request_id INTEGER,
                user_id INTEGER NOT NULL,
                user_role TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                status TEXT DEFAULT 'ACTIVE',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME
            );
        `);

        // 17. AI Demand Forecasting & Workforce Rebalancing Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS demand_forecasts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                district_zone TEXT NOT NULL,
                category TEXT NOT NULL,
                current_demand_index INTEGER DEFAULT 75,
                predicted_surge_pct INTEGER DEFAULT 25,
                recommended_workers INTEGER DEFAULT 12,
                active_workers INTEGER DEFAULT 8,
                season_factor TEXT NOT NULL
            );
        `);

        // Schema Migrations for Existing Tables
        try { await db.execute("ALTER TABLE worker_profiles ADD COLUMN latitude REAL DEFAULT 12.9716"); } catch (_) {}
        try { await db.execute("ALTER TABLE worker_profiles ADD COLUMN longitude REAL DEFAULT 77.5946"); } catch (_) {}
        try { await db.execute("ALTER TABLE worker_profiles ADD COLUMN service_radius_km REAL DEFAULT 10.0"); } catch (_) {}
        try { await db.execute("ALTER TABLE worker_profiles ADD COLUMN welfare_balance REAL DEFAULT 0.0"); } catch (_) {}

        try { await db.execute("ALTER TABLE service_requests ADD COLUMN booking_type TEXT DEFAULT 'REGULAR'"); } catch (_) {}
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN urgency_level TEXT DEFAULT 'NORMAL'"); } catch (_) {}
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN scheduled_date TEXT"); } catch (_) {}
        try { await db.execute("ALTER TABLE service_requests ADD COLUMN scheduled_slot TEXT"); } catch (_) {}

        // ================= SEED DATA =================
        // Skills
        const skillsRes = await db.execute('SELECT COUNT(*) as count FROM skills');
        if (skillsRes.rows[0].count === 0) {
            const defaultSkills = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason', 'Cleaning', 'HVAC Technician', 'Caregiver'];
            for (const s of defaultSkills) {
                await db.execute({ sql: 'INSERT INTO skills (name) VALUES (?)', args: [s] });
            }
        }

        // Services
        const servRes = await db.execute('SELECT COUNT(*) as count FROM services');
        if (servRes.rows[0].count === 0) {
            await db.execute({ sql: 'INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)', args: ['Master Electrical Repair', 'Electrical', 499] });
            await db.execute({ sql: 'INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)', args: ['Precision Plumbing', 'Plumbing', 399] });
            await db.execute({ sql: 'INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)', args: ['Custom Carpentry', 'Carpentry', 599] });
            await db.execute({ sql: 'INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)', args: ['Wall Painting & Finishing', 'Painting', 799] });
            await db.execute({ sql: 'INSERT INTO services (name, category, base_price) VALUES (?, ?, ?)', args: ['Deep Home Cleaning', 'Cleaning', 699] });
        }

        // Seed Demand Forecasts
        const forecastRes = await db.execute('SELECT COUNT(*) as count FROM demand_forecasts');
        if (forecastRes.rows[0].count === 0) {
            const sampleForecasts = [
                { zone: 'Koramangala & HSR Sector 2', category: 'Electrical', demand: 92, surge: 45, rec: 15, active: 9, season: 'Summer Pre-Monsoon Surge' },
                { zone: 'Indiranagar & Domlur', category: 'Plumbing', demand: 85, surge: 30, rec: 12, active: 7, season: 'High Municipal Pressure Testing' },
                { zone: 'Whitefield Tech Corridor', category: 'Cleaning', demand: 88, surge: 35, rec: 14, active: 8, season: 'Quarterly Commercial Shift' },
                { zone: 'Jayanagar & JP Nagar', category: 'Carpentry', demand: 70, surge: 15, rec: 8, active: 6, season: 'Standard Renovation Cycle' }
            ];
            for (const f of sampleForecasts) {
                await db.execute({
                    sql: 'INSERT INTO demand_forecasts (district_zone, category, current_demand_index, predicted_surge_pct, recommended_workers, active_workers, season_factor) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    args: [f.zone, f.category, f.demand, f.surge, f.rec, f.active, f.season]
                });
            }
        }

        console.log('CoopServe Database initialized successfully with clean schema and service categories.');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

module.exports = { db, initDb };
