const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const { db, initDb } = require('./db');
const notificationService = require('./notificationService');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Database on startup
initDb();

// Create HTTP server & attach WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('error', (err) => {
    // Gracefully handle underlying http server errors
});

// Map to keep track of active sockets per user & request room
// Key: userId, Value: Set of WebSocket clients
const userSockets = new Map();
// Key: requestId, Value: Set of WebSocket clients
const roomSockets = new Map();

wss.on('connection', (ws) => {
    ws.userId = null;
    ws.requestId = null;

    ws.on('message', async (raw) => {
        try {
            const data = JSON.parse(raw);

            if (data.type === 'AUTH') {
                ws.userId = data.userId;
                if (!userSockets.has(ws.userId)) {
                    userSockets.set(ws.userId, new Set());
                }
                userSockets.get(ws.userId).add(ws);
                ws.send(JSON.stringify({ type: 'AUTH_OK', userId: ws.userId }));
            }

            if (data.type === 'JOIN_ROOM') {
                ws.requestId = data.requestId;
                if (!roomSockets.has(ws.requestId)) {
                    roomSockets.set(ws.requestId, new Set());
                }
                roomSockets.get(ws.requestId).add(ws);
                ws.send(JSON.stringify({ type: 'JOINED_ROOM', requestId: ws.requestId }));
            }

            if (data.type === 'CHAT_MESSAGE') {
                const { service_request_id, sender_id, receiver_id, message } = data;
                if (!service_request_id || !sender_id || !receiver_id || !message) return;

                // Save to DB
                const insRes = await db.execute({
                    sql: 'INSERT INTO chat_messages (service_request_id, sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, ?, 0)',
                    args: [service_request_id, sender_id, receiver_id, message]
                });
                const msgId = Number(insRes.lastInsertRowid);

                const senderRes = await db.execute({ sql: 'SELECT id, name, role FROM users WHERE id = ?', args: [sender_id] });
                const receiverRes = await db.execute({ sql: 'SELECT id, name, role, phone FROM users WHERE id = ?', args: [receiver_id] });
                const sender = senderRes.rows[0] || { name: 'User' };
                const receiver = receiverRes.rows[0] || { name: 'User' };

                const chatPayload = {
                    id: msgId,
                    service_request_id,
                    sender_id,
                    receiver_id,
                    message,
                    sender_name: sender.name,
                    sender_role: sender.role,
                    is_read: 0,
                    created_at: new Date().toISOString()
                };

                // Broadcast to room
                if (roomSockets.has(service_request_id)) {
                    roomSockets.get(service_request_id).forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', data: chatPayload }));
                        }
                    });
                }

                // Also trigger in-app / push notification to receiver
                await notificationService.notifyChatMessage(receiver, sender, message, service_request_id);
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
        }
    });

    ws.on('close', () => {
        if (ws.userId && userSockets.has(ws.userId)) {
            userSockets.get(ws.userId).delete(ws);
            if (userSockets.get(ws.userId).size === 0) userSockets.delete(ws.userId);
        }
        if (ws.requestId && roomSockets.has(ws.requestId)) {
            roomSockets.get(ws.requestId).delete(ws);
            if (roomSockets.get(ws.requestId).size === 0) roomSockets.delete(ws.requestId);
        }
    });
});

// Configure Notification Broadcaster to push via WebSockets
notificationService.setWebSocketBroadcaster((userId, payload) => {
    if (userSockets.has(userId)) {
        userSockets.get(userId).forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });
    }
});

// ================= AUTHENTICATION =================
app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, role, gender, address, city, pin_code, experience_years, description, service_area, hourly_rate, primary_skill } = req.body;
    
    if (!name || !name.trim() || !email || !email.trim() || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide your Full Name, Email, Password, and select a Role.' });
    }

    try {
        const cleanEmail = email.trim().toLowerCase();
        const existing = await db.execute({ sql: 'SELECT id FROM users WHERE LOWER(email) = ?', args: [cleanEmail] });
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in or use a different email.' });
        }

        const userRes = await db.execute({
            sql: 'INSERT INTO users (name, email, phone, password, role, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [name.trim(), cleanEmail, phone ? phone.trim() : '', password, role.toUpperCase(), gender || 'Female', 'ACTIVE']
        });
        const userId = Number(userRes.lastInsertRowid);

        let profile = null;
        if (role.toUpperCase() === 'CUSTOMER') {
            await db.execute({
                sql: 'INSERT INTO customer_profiles (user_id, address, city, pin_code) VALUES (?, ?, ?, ?)',
                args: [userId, address || 'HSR Layout Sector 2', city || 'Bangalore', pin_code || '560102']
            });
            const cpRow = await db.execute({ sql: 'SELECT * FROM customer_profiles WHERE user_id = ?', args: [userId] });
            profile = cpRow.rows[0] || null;
        } else if (role.toUpperCase() === 'WORKER') {
            const workerRes = await db.execute({
                sql: 'INSERT INTO worker_profiles (user_id, experience_years, description, service_area, hourly_rate, verification_status, latitude, longitude, service_radius_km, welfare_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                args: [userId, Number(experience_years) || 2, description || 'Federation-Certified Trade Professional', service_area || 'Bengaluru Urban', Number(hourly_rate) || 499, 'VERIFIED', 12.9352, 77.6245, 15, 0]
            });
            const workerProfileId = Number(workerRes.lastInsertRowid);

            if (primary_skill) {
                let skillRow = await db.execute({ sql: 'SELECT id FROM skills WHERE name = ?', args: [primary_skill] });
                let skillId;
                if (skillRow.rows.length === 0) {
                    const skillIns = await db.execute({ sql: 'INSERT INTO skills (name) VALUES (?)', args: [primary_skill] });
                    skillId = Number(skillIns.lastInsertRowid);
                } else {
                    skillId = Number(skillRow.rows[0].id);
                }
                await db.execute({
                    sql: 'INSERT OR IGNORE INTO worker_skills (worker_id, skill_id) VALUES (?, ?)',
                    args: [workerProfileId, skillId]
                });
            }

            await db.execute({
                sql: 'INSERT INTO worker_verifications (worker_id, status) VALUES (?, ?)',
                args: [workerProfileId, 'VERIFIED']
            });

            const wpRow = await db.execute({ sql: 'SELECT * FROM worker_profiles WHERE user_id = ?', args: [userId] });
            profile = wpRow.rows[0] || null;
        }

        const newUserRes = await db.execute({ sql: 'SELECT id, name, email, phone, role, gender, status FROM users WHERE id = ?', args: [userId] });
        const user = newUserRes.rows[0];
        res.json({ success: true, message: 'Registration successful', data: { user, profile } });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await db.execute({
            sql: 'SELECT id, name, email, phone, role, gender, status FROM users WHERE email = ? AND password = ?',
            args: [email, password]
        });
        
        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const user = userRes.rows[0];

        let profile = null;
        if (user.role === 'WORKER') {
            const wpRes = await db.execute({ sql: 'SELECT * FROM worker_profiles WHERE user_id = ?', args: [user.id] });
            profile = wpRes.rows[0] || null;
            if (profile) {
                const verRes = await db.execute({ sql: 'SELECT * FROM worker_verifications WHERE worker_id = ? ORDER BY id DESC LIMIT 1', args: [profile.id] });
                profile.verification_detail = verRes.rows[0] || null;
            }
        } else if (user.role === 'CUSTOMER') {
            const cpRes = await db.execute({ sql: 'SELECT * FROM customer_profiles WHERE user_id = ?', args: [user.id] });
            profile = cpRes.rows[0] || null;
        }

        res.json({ success: true, message: 'Login successful', data: { user, profile } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= WORKERS =================
app.get('/api/workers', async (req, res) => {
    const customerGender = req.query.gender;
    try {
        let query = `
            SELECT u.id as user_id, u.name, u.email, u.phone, u.gender, wp.id as worker_profile_id, wp.experience_years, 
                   wp.description, wp.service_area, wp.hourly_rate, wp.verification_status,
                   COALESCE((SELECT AVG(r.rating) FROM ratings r WHERE r.worker_id = u.id), 5.0) as avg_rating,
                   COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id AND sr.status = 'COMPLETED'), 0) as completed_jobs
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE wp.verification_status = 'VERIFIED' AND u.status = 'ACTIVE'
        `;

        if (customerGender && customerGender.toLowerCase() === 'female') {
            query += ` AND u.gender = 'Female'`;
        }

        let workersRes = await db.execute(query);
        let workers = workersRes.rows;

        if (customerGender && customerGender.toLowerCase() === 'female' && workers.length === 0) {
            const fallbackRes = await db.execute(`
                SELECT u.id as user_id, u.name, u.email, u.phone, u.gender, wp.id as worker_profile_id, wp.experience_years, 
                       wp.description, wp.service_area, wp.hourly_rate, wp.verification_status,
                       COALESCE((SELECT AVG(r.rating) FROM ratings r WHERE r.worker_id = u.id), 5.0) as avg_rating,
                       COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id AND sr.status = 'COMPLETED'), 0) as completed_jobs
                FROM users u
                JOIN worker_profiles wp ON u.id = wp.user_id
                WHERE wp.verification_status = 'VERIFIED' AND u.status = 'ACTIVE'
            `);
            workers = fallbackRes.rows;
        }

        res.json({ success: true, data: workers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/workers/documents', async (req, res) => {
    const { worker_id, document_type, document_url } = req.body;
    try {
        await db.execute({
            sql: 'INSERT INTO worker_documents (worker_id, document_type, document_url, verification_status) VALUES (?, ?, ?, ?)',
            args: [worker_id, document_type, document_url, 'PENDING']
        });
        res.json({ success: true, message: 'Document uploaded successfully and awaiting admin verification' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= SERVICES =================
app.get('/api/services', async (req, res) => {
    try {
        const servicesRes = await db.execute('SELECT * FROM services');
        res.json({ success: true, data: servicesRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= SERVICE REQUESTS =================
app.post('/api/requests', async (req, res) => {
    const { customer_id, worker_id, service_id, description, location, price, advance_paid, booking_type, urgency_level, scheduled_date, scheduled_slot } = req.body;
    try {
        const wpRes = await db.execute({ sql: 'SELECT verification_status FROM worker_profiles WHERE user_id = ?', args: [worker_id] });
        const workerProfile = wpRes.rows[0];
        if (!workerProfile || workerProfile.verification_status !== 'VERIFIED') {
            return res.status(400).json({ success: false, message: 'Worker is not verified and cannot accept service requests.' });
        }

        const advAmount = Number(advance_paid) || 0;
        const paymentStatus = advAmount >= price ? 'FULLY_PAID' : (advAmount > 0 ? 'ADVANCE_PAID' : 'UNPAID');

        const reqRes = await db.execute({
            sql: `INSERT INTO service_requests (customer_id, worker_id, service_id, description, location, price, advance_paid, balance_paid, payment_status, status, booking_type, urgency_level, scheduled_date, scheduled_slot) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
            args: [
                customer_id, 
                worker_id, 
                service_id, 
                description || '', 
                location, 
                price, 
                advAmount, 
                paymentStatus, 
                'REQUESTED',
                booking_type || 'REGULAR',
                urgency_level || 'NORMAL',
                scheduled_date || null,
                scheduled_slot || null
            ]
        });
        const requestId = Number(reqRes.lastInsertRowid);

        // Fetch details for SMS & Push notification trigger
        const workerRes = await db.execute({ sql: 'SELECT id, name, phone FROM users WHERE id = ?', args: [worker_id] });
        const custRes = await db.execute({ sql: 'SELECT id, name, phone FROM users WHERE id = ?', args: [customer_id] });
        const servRes = await db.execute({ sql: 'SELECT name FROM services WHERE id = ?', args: [service_id] });

        const workerObj = workerRes.rows[0] || {};
        const custObj = custRes.rows[0] || {};
        const serviceName = servRes.rows[0] ? servRes.rows[0].name : 'Service';

        // Trigger SMS + Push notification to assigned worker
        await notificationService.notifyNewServiceRequest(workerObj, { id: requestId, location }, serviceName, custObj);

        res.json({ success: true, message: 'Service request created successfully', data: { requestId, booking_type, scheduled_date, scheduled_slot } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/requests/user/:user_id/:role', async (req, res) => {
    const { user_id, role } = req.params;
    try {
        let query = '';
        if (role.toUpperCase() === 'CUSTOMER') {
            query = `
                SELECT sr.*, s.name as service_name, u.name as worker_name, u.phone as worker_phone, u.gender as worker_gender,
                       (SELECT COUNT(*) FROM chat_messages cm WHERE cm.service_request_id = sr.id AND cm.receiver_id = ? AND cm.is_read = 0) as unread_messages
                FROM service_requests sr
                JOIN services s ON sr.service_id = s.id
                LEFT JOIN users u ON sr.worker_id = u.id
                WHERE sr.customer_id = ?
                ORDER BY sr.id DESC
            `;
            const requestsRes = await db.execute({ sql: query, args: [user_id, user_id] });
            res.json({ success: true, data: requestsRes.rows });
        } else if (role.toUpperCase() === 'WORKER') {
            query = `
                SELECT sr.*, s.name as service_name, u.name as customer_name, u.phone as customer_phone, u.gender as customer_gender,
                       (SELECT COUNT(*) FROM chat_messages cm WHERE cm.service_request_id = sr.id AND cm.receiver_id = ? AND cm.is_read = 0) as unread_messages
                FROM service_requests sr
                JOIN services s ON sr.service_id = s.id
                JOIN users u ON sr.customer_id = u.id
                WHERE sr.worker_id = ?
                ORDER BY sr.id DESC
            `;
            const requestsRes = await db.execute({ sql: query, args: [user_id, user_id] });
            res.json({ success: true, data: requestsRes.rows });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/requests/:id/status', async (req, res) => {
    const { status } = req.body;
    const requestId = req.params.id;
    try {
        if (status === 'COMPLETED') {
            await db.execute({
                sql: "UPDATE service_requests SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?",
                args: [status, requestId]
            });
        } else {
            await db.execute({
                sql: "UPDATE service_requests SET status = ? WHERE id = ?",
                args: [status, requestId]
            });
        }

        // Fetch request, worker, customer details to trigger SMS/Push notification
        const reqRow = await db.execute({
            sql: `SELECT sr.*, s.name as service_name, w.name as worker_name, w.phone as worker_phone, c.name as customer_name, c.phone as customer_phone
                  FROM service_requests sr
                  JOIN services s ON sr.service_id = s.id
                  JOIN users w ON sr.worker_id = w.id
                  JOIN users c ON sr.customer_id = c.id
                  WHERE sr.id = ?`,
            args: [requestId]
        });

        if (reqRow.rows.length > 0) {
            const row = reqRow.rows[0];
            await notificationService.notifyStatusUpdate(
                { id: row.customer_id, phone: row.customer_phone, name: row.customer_name },
                { id: row.id, service_name: row.service_name },
                status,
                { id: row.worker_id, name: row.worker_name, phone: row.worker_phone }
            );
        }

        res.json({ success: true, message: `Request status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= REAL-TIME CHAT & MESSAGING MODULE =================
app.get('/api/chat/messages/:requestId', async (req, res) => {
    const { requestId } = req.params;
    try {
        const messagesRes = await db.execute({
            sql: `SELECT cm.*, u.name as sender_name, u.role as sender_role
                  FROM chat_messages cm
                  JOIN users u ON cm.sender_id = u.id
                  WHERE cm.service_request_id = ?
                  ORDER BY cm.id ASC`,
            args: [requestId]
        });
        res.json({ success: true, data: messagesRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/chat/messages', async (req, res) => {
    const { service_request_id, sender_id, receiver_id, message } = req.body;
    if (!service_request_id || !sender_id || !receiver_id || !message) {
        return res.status(400).json({ success: false, message: 'Missing chat message parameters' });
    }

    try {
        const insRes = await db.execute({
            sql: 'INSERT INTO chat_messages (service_request_id, sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, ?, 0)',
            args: [service_request_id, sender_id, receiver_id, message]
        });
        const msgId = Number(insRes.lastInsertRowid);

        const senderRes = await db.execute({ sql: 'SELECT id, name, role FROM users WHERE id = ?', args: [sender_id] });
        const receiverRes = await db.execute({ sql: 'SELECT id, name, role, phone FROM users WHERE id = ?', args: [receiver_id] });
        const sender = senderRes.rows[0] || { name: 'User' };
        const receiver = receiverRes.rows[0] || { name: 'User' };

        const payload = {
            id: msgId,
            service_request_id,
            sender_id,
            receiver_id,
            message,
            sender_name: sender.name,
            sender_role: sender.role,
            is_read: 0,
            created_at: new Date().toISOString()
        };

        // Broadcast to WebSocket room
        if (roomSockets.has(Number(service_request_id))) {
            roomSockets.get(Number(service_request_id)).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', data: payload }));
                }
            });
        }

        // Notify receiver
        await notificationService.notifyChatMessage(receiver, sender, message, service_request_id);

        res.json({ success: true, data: payload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/chat/read/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { userId } = req.body;
    try {
        await db.execute({
            sql: 'UPDATE chat_messages SET is_read = 1 WHERE service_request_id = ? AND receiver_id = ?',
            args: [requestId, userId]
        });
        res.json({ success: true, message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= PAYMENT GATEWAY & WAGE SPLITS =================
app.post('/api/payments/process', async (req, res) => {
    const { service_request_id, customer_id, worker_id, amount, payment_type, payment_method } = req.body;

    if (!service_request_id || !customer_id || !worker_id || !amount || !payment_type) {
        return res.status(400).json({ success: false, message: 'Missing payment required fields' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Cooperative Transparent Wage Split Formula:
    // 80% Direct Worker Wage Payout
    // 10% Society Welfare & Insurance Fund
    // 5% Federation Oversight Fund
    // 5% Platform Infrastructure Fee
    const workerShare = +(payAmount * 0.80).toFixed(2);
    const societyShare = +(payAmount * 0.10).toFixed(2);
    const federationShare = +(payAmount * 0.05).toFixed(2);
    const platformFee = +(payAmount - workerShare - societyShare - federationShare).toFixed(2);

    const transactionId = `TXN-COOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        // Insert Payment Record
        const payRes = await db.execute({
            sql: `INSERT INTO payments (service_request_id, customer_id, worker_id, amount, payment_type, payment_method, transaction_id, worker_share, society_welfare_share, federation_share, platform_fee, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
            args: [service_request_id, customer_id, worker_id, payAmount, payment_type, payment_method || 'UPI_QR', transactionId, workerShare, societyShare, federationShare, platformFee]
        });
        const paymentId = Number(payRes.lastInsertRowid);

        // Update Service Request Payment Status and Credit Worker Welfare Balance
        if (payment_type === 'ADVANCE_DEPOSIT') {
            await db.execute({
                sql: `UPDATE service_requests SET advance_paid = advance_paid + ?, payment_status = 'ADVANCE_PAID' WHERE id = ?`,
                args: [payAmount, service_request_id]
            });
        } else if (payment_type === 'POST_SERVICE_SETTLEMENT' || payment_type === 'FULL_PAYMENT') {
            await db.execute({
                sql: `UPDATE service_requests SET balance_paid = balance_paid + ?, payment_status = 'FULLY_PAID' WHERE id = ?`,
                args: [payAmount, service_request_id]
            });
        }

        // Credit society welfare balance into the worker's welfare passbook
        await db.execute({
            sql: `UPDATE worker_profiles SET welfare_balance = COALESCE(welfare_balance, 0) + ? WHERE user_id = ?`,
            args: [societyShare, worker_id]
        });

        // Fetch User and Worker data for Notification hooks
        const custRes = await db.execute({ sql: 'SELECT id, name, phone FROM users WHERE id = ?', args: [customer_id] });
        const workerRes = await db.execute({ sql: 'SELECT id, name, phone FROM users WHERE id = ?', args: [worker_id] });
        const cust = custRes.rows[0] || {};
        const worker = workerRes.rows[0] || {};

        const paymentRecord = {
            id: paymentId,
            service_request_id,
            amount: payAmount,
            payment_type,
            payment_method,
            transaction_id: transactionId,
            worker_share: workerShare,
            society_welfare_share: societyShare,
            federation_share: federationShare,
            platform_fee: platformFee,
            status: 'SUCCESS',
            created_at: new Date().toISOString()
        };

        // Dispatch SMS & Push Notifications
        await notificationService.notifyPaymentSuccess(cust, worker, paymentRecord, { id: service_request_id });

        res.json({
            success: true,
            message: 'Payment processed and transparent wage splits disbursed successfully',
            data: paymentRecord
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/payments/request/:requestId', async (req, res) => {
    const { requestId } = req.params;
    try {
        const paymentsRes = await db.execute({
            sql: 'SELECT * FROM payments WHERE service_request_id = ? ORDER BY id DESC',
            args: [requestId]
        });
        res.json({ success: true, data: paymentsRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/payments/invoice/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    try {
        const invRes = await db.execute({
            sql: `SELECT p.*, sr.description as request_desc, sr.location, s.name as service_name, c.name as customer_name, c.email as customer_email, w.name as worker_name
                  FROM payments p
                  JOIN service_requests sr ON p.service_request_id = sr.id
                  JOIN services s ON sr.service_id = s.id
                  JOIN users c ON p.customer_id = c.id
                  JOIN users w ON p.worker_id = w.id
                  WHERE p.transaction_id = ?`,
            args: [transactionId]
        });
        if (invRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found' });
        res.json({ success: true, data: invRes.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= NOTIFICATIONS MODULE =================
app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const notifsRes = await db.execute({
            sql: 'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50',
            args: [userId]
        });
        res.json({ success: true, data: notifsRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/notifications/test-sms', async (req, res) => {
    const { userId, phone, message } = req.body;
    try {
        const notif = await notificationService.dispatchNotification({
            userId: userId || 1,
            title: '🧪 Manual SMS Test Trigger',
            message: message || '[CoopServe Test] This is a test SMS alert verifying Twilio carrier gateway dispatch.',
            channel: 'SMS_TWILIO',
            recipientPhone: phone || '+919876543210'
        });
        res.json({ success: true, message: 'Test SMS dispatched successfully', data: notif });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= COMPLAINTS & DISPUTE RESOLUTION =================
app.post('/api/complaints', async (req, res) => {
    const { service_request_id, complainant_id, respondent_id, type, description } = req.body;
    if (!complainant_id || !type || !description) {
        return res.status(400).json({ success: false, message: 'Missing complaint details' });
    }
    try {
        const ins = await db.execute({
            sql: 'INSERT INTO complaints_disputes (service_request_id, complainant_id, respondent_id, type, description, status) VALUES (?, ?, ?, ?, ?, ?)',
            args: [service_request_id || null, complainant_id, respondent_id || null, type, description, 'OPEN']
        });
        res.json({ success: true, message: 'Dispute ticket registered. Administrator will investigate promptly.', data: { ticketId: Number(ins.lastInsertRowid) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/disputes/:id/resolve', async (req, res) => {
    const disputeId = req.params.id;
    const { status, resolution_notes, resolved_by } = req.body;
    try {
        await db.execute({
            sql: 'UPDATE complaints_disputes SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
            args: [status || 'RESOLVED', resolution_notes || '', resolved_by || 1, disputeId]
        });
        res.json({ success: true, message: 'Dispute ticket status updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= ADMIN REPORTING & ADVANCED CSV EXPORTS =================
app.get('/api/admin/reports/wage-splits', async (req, res) => {
    try {
        const summaryRes = await db.execute(`
            SELECT 
                COUNT(p.id) as total_transactions,
                COALESCE(SUM(p.amount), 0) as total_volume,
                COALESCE(SUM(p.worker_share), 0) as total_worker_wages,
                COALESCE(SUM(p.society_welfare_share), 0) as total_welfare_funds,
                COALESCE(SUM(p.federation_share), 0) as total_federation_funds,
                COALESCE(SUM(p.platform_fee), 0) as total_platform_fees
            FROM payments p
            WHERE p.status = 'SUCCESS'
        `);

        const transactionsRes = await db.execute(`
            SELECT p.*, u_w.name as worker_name, u_c.name as customer_name, s.name as service_name
            FROM payments p
            JOIN users u_w ON p.worker_id = u_w.id
            JOIN users u_c ON p.customer_id = u_c.id
            JOIN service_requests sr ON p.service_request_id = sr.id
            JOIN services s ON sr.service_id = s.id
            ORDER BY p.id DESC
        `);

        res.json({
            success: true,
            data: {
                summary: summaryRes.rows[0],
                transactions: transactionsRes.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/reports/worker-utilization', async (req, res) => {
    try {
        const workersRes = await db.execute(`
            SELECT 
                u.id as worker_id,
                u.name as worker_name,
                u.phone as worker_phone,
                u.gender,
                wp.experience_years,
                wp.verification_status,
                wp.hourly_rate,
                (SELECT GROUP_CONCAT(sk.name, ', ') FROM worker_skills ws JOIN skills sk ON ws.skill_id = sk.id WHERE ws.worker_id = wp.id) as skills,
                COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id), 0) as total_assigned,
                COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id AND sr.status = 'COMPLETED'), 0) as completed_jobs,
                COALESCE((SELECT AVG(r.rating) FROM ratings r WHERE r.worker_id = u.id), 5.0) as average_rating,
                COALESCE((SELECT SUM(p.worker_share) FROM payments p WHERE p.worker_id = u.id AND p.status = 'SUCCESS'), 0) as total_earnings
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE u.status = 'ACTIVE'
            ORDER BY completed_jobs DESC
        `);

        const formatted = workersRes.rows.map(w => ({
            ...w,
            average_rating: Number(w.average_rating || 5.0).toFixed(1),
            total_earnings: Number(w.total_earnings || 0).toFixed(2),
            completion_rate: w.total_assigned > 0 ? ((w.completed_jobs / w.total_assigned) * 100).toFixed(0) + '%' : '100%'
        }));

        res.json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/reports/disputes', async (req, res) => {
    try {
        const disputesRes = await db.execute(`
            SELECT cd.*, u_c.name as complainant_name, u_c.role as complainant_role, u_r.name as respondent_name, u_adm.name as resolved_by_name
            FROM complaints_disputes cd
            JOIN users u_c ON cd.complainant_id = u_c.id
            LEFT JOIN users u_r ON cd.respondent_id = u_r.id
            LEFT JOIN users u_adm ON cd.resolved_by = u_adm.id
            ORDER BY cd.id DESC
        `);
        res.json({ success: true, data: disputesRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CSV Export Generator Endpoint
app.get('/api/admin/reports/export/:type', async (req, res) => {
    const { type } = req.params;

    try {
        let filename = `coopserve-${type}-${Date.now()}.csv`;
        let csvContent = '';

        if (type === 'wage-splits') {
            const rows = await db.execute(`
                SELECT p.transaction_id, p.created_at, p.payment_type, p.payment_method, p.amount,
                       p.worker_share, p.society_welfare_share, p.federation_share, p.platform_fee,
                       u_w.name as worker_name, u_c.name as customer_name, s.name as service_name
                FROM payments p
                JOIN users u_w ON p.worker_id = u_w.id
                JOIN users u_c ON p.customer_id = u_c.id
                JOIN service_requests sr ON p.service_request_id = sr.id
                JOIN services s ON sr.service_id = s.id
                ORDER BY p.id DESC
            `);

            const header = ['Transaction ID', 'Date', 'Customer', 'Worker', 'Service', 'Payment Type', 'Method', 'Gross Total (₹)', 'Worker 80% Wage (₹)', 'Society Welfare 10% (₹)', 'Federation 5% (₹)', 'Platform Fee 5% (₹)'];
            const lines = [header.join(',')];

            rows.rows.forEach(r => {
                lines.push([
                    `"${r.transaction_id}"`,
                    `"${r.created_at}"`,
                    `"${(r.customer_name || '').replace(/"/g, '""')}"`,
                    `"${(r.worker_name || '').replace(/"/g, '""')}"`,
                    `"${(r.service_name || '').replace(/"/g, '""')}"`,
                    `"${r.payment_type}"`,
                    `"${r.payment_method}"`,
                    Number(r.amount).toFixed(2),
                    Number(r.worker_share).toFixed(2),
                    Number(r.society_welfare_share).toFixed(2),
                    Number(r.federation_share).toFixed(2),
                    Number(r.platform_fee).toFixed(2)
                ].join(','));
            });

            csvContent = lines.join('\n');

        } else if (type === 'worker-utilization') {
            const rows = await db.execute(`
                SELECT u.id as worker_id, u.name, u.phone, u.gender, wp.experience_years, wp.verification_status,
                       COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id), 0) as total_jobs,
                       COALESCE((SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id AND sr.status = 'COMPLETED'), 0) as completed_jobs,
                       COALESCE((SELECT AVG(r.rating) FROM ratings r WHERE r.worker_id = u.id), 5.0) as avg_rating,
                       COALESCE((SELECT SUM(p.worker_share) FROM payments p WHERE p.worker_id = u.id AND p.status = 'SUCCESS'), 0) as total_earnings
                FROM users u
                JOIN worker_profiles wp ON u.id = wp.user_id
                WHERE u.status = 'ACTIVE'
            `);

            const header = ['Worker ID', 'Name', 'Phone', 'Gender', 'Experience (Yrs)', 'Status', 'Total Assigned', 'Completed Jobs', 'Avg Rating', 'Total Payouts (₹)'];
            const lines = [header.join(',')];

            rows.rows.forEach(r => {
                lines.push([
                    r.worker_id,
                    `"${r.name.replace(/"/g, '""')}"`,
                    `"${r.phone || ''}"`,
                    `"${r.gender || 'Male'}"`,
                    r.experience_years || 0,
                    `"${r.verification_status}"`,
                    r.total_jobs,
                    r.completed_jobs,
                    Number(r.avg_rating || 5.0).toFixed(1),
                    Number(r.total_earnings || 0).toFixed(2)
                ].join(','));
            });

            csvContent = lines.join('\n');

        } else if (type === 'disputes') {
            const rows = await db.execute(`
                SELECT cd.id, cd.service_request_id, cd.type, cd.description, cd.status, cd.resolution_notes, cd.created_at, cd.resolved_at,
                       u_c.name as complainant_name, u_r.name as respondent_name
                FROM complaints_disputes cd
                JOIN users u_c ON cd.complainant_id = u_c.id
                LEFT JOIN users u_r ON cd.respondent_id = u_r.id
                ORDER BY cd.id DESC
            `);

            const header = ['Dispute ID', 'Service Request ID', 'Complainant', 'Respondent', 'Category', 'Description', 'Status', 'Resolution Notes', 'Filed At', 'Resolved At'];
            const lines = [header.join(',')];

            rows.rows.forEach(r => {
                lines.push([
                    r.id,
                    r.service_request_id || 'N/A',
                    `"${(r.complainant_name || '').replace(/"/g, '""')}"`,
                    `"${(r.respondent_name || 'N/A').replace(/"/g, '""')}"`,
                    `"${r.type}"`,
                    `"${(r.description || '').replace(/"/g, '""')}"`,
                    `"${r.status}"`,
                    `"${(r.resolution_notes || '').replace(/"/g, '""')}"`,
                    `"${r.created_at}"`,
                    `"${r.resolved_at || 'Pending'}"`
                ].join(','));
            });

            csvContent = lines.join('\n');
        } else {
            return res.status(400).json({ success: false, message: 'Invalid report export type' });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Export failed: ' + err.message });
    }
});

// ================= RATINGS =================
app.post('/api/ratings', async (req, res) => {
    const { customer_id, worker_id, service_request_id, rating, review } = req.body;
    try {
        await db.execute({
            sql: 'INSERT INTO ratings (customer_id, worker_id, service_request_id, rating, review) VALUES (?, ?, ?, ?, ?)',
            args: [customer_id, worker_id, service_request_id, rating, review || '']
        });
        res.json({ success: true, message: 'Rating submitted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= ADMIN VERIFICATION & STATS =================
app.get('/api/admin/workers/pending', async (req, res) => {
    try {
        const query = `
            SELECT u.id as user_id, u.name, u.email, u.phone, u.gender, wp.id as worker_profile_id, wp.experience_years, 
                   wp.description, wp.service_area, wp.hourly_rate, wp.verification_status
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE wp.verification_status != 'VERIFIED'
        `;
        const workersRes = await db.execute(query);
        let workers = workersRes.rows;

        for (let w of workers) {
            const docsRes = await db.execute({ sql: 'SELECT * FROM worker_documents WHERE worker_id = ?', args: [w.worker_profile_id] });
            w.documents = docsRes.rows;
        }
        res.json({ success: true, data: workers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/workers/:worker_profile_id/verify', async (req, res) => {
    const { status, rejection_reason } = req.body;
    const workerProfileId = req.params.worker_profile_id;
    try {
        await db.execute({
            sql: 'UPDATE worker_profiles SET verification_status = ? WHERE id = ?',
            args: [status, workerProfileId]
        });
        await db.execute({
            sql: 'INSERT INTO worker_verifications (worker_id, status, verified_at, rejection_reason) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
            args: [workerProfileId, status, rejection_reason || '']
        });
        res.json({ success: true, message: `Worker verification status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= GEO-LOCATION & PROXIMITY MATCHING =================
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
}

app.get('/api/workers/nearby', async (req, res) => {
    const userLat = Number(req.query.lat) || 12.9716;
    const userLng = Number(req.query.lng) || 77.5946;
    const radius = Number(req.query.radius) || 15;
    const category = req.query.category;
    const gender = req.query.gender;

    try {
        let query = `
            SELECT u.id as user_id, u.name, u.email, u.phone, u.gender,
                   wp.id as profile_id, wp.experience_years, wp.description, wp.service_area, wp.hourly_rate,
                   COALESCE(wp.latitude, 12.9716) as latitude,
                   COALESCE(wp.longitude, 77.5946) as longitude,
                   COALESCE(wp.service_radius_km, 10.0) as service_radius_km,
                   wp.verification_status,
                   (SELECT AVG(r.rating) FROM ratings r WHERE r.worker_id = u.id) as avg_rating,
                   (SELECT COUNT(sr.id) FROM service_requests sr WHERE sr.worker_id = u.id AND sr.status = 'COMPLETED') as completed_jobs,
                   (SELECT GROUP_CONCAT(sk.name, ', ') FROM worker_skills ws JOIN skills sk ON ws.skill_id = sk.id WHERE ws.worker_id = wp.id) as skills
            FROM users u
            JOIN worker_profiles wp ON u.id = wp.user_id
            WHERE wp.verification_status = 'VERIFIED' AND u.status = 'ACTIVE'
        `;
        const args = [];
        if (gender) {
            query += ' AND u.gender = ?';
            args.push(gender);
        }

        const workersRes = await db.execute({ sql: query, args });
        
        const rankedWorkers = workersRes.rows.map(w => {
            const distance = calculateHaversineDistance(userLat, userLng, Number(w.latitude || 12.9716), Number(w.longitude || 77.5946));
            const etaMins = Math.max(5, Math.round(distance * 2.5 + 5));
            return {
                ...w,
                distance_km: distance,
                eta_minutes: etaMins,
                avg_rating: Number(w.avg_rating || 5.0).toFixed(1)
            };
        })
        .filter(w => {
            if (category && category !== 'ALL') {
                const text = ((w.skills || '') + ' ' + (w.description || '') + ' ' + (w.name || '')).toLowerCase();
                if (!text.includes(category.toLowerCase())) return false;
            }
            return w.distance_km <= radius;
        })
        .sort((a, b) => a.distance_km - b.distance_km);

        res.json({
            success: true,
            data: rankedWorkers,
            meta: { userLat, userLng, radius_km: radius, total_found: rankedWorkers.length }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= WORKER WELFARE PASSBOOK & CLAIMS =================
app.get('/api/welfare/passbook/:workerId', async (req, res) => {
    const { workerId } = req.params;
    try {
        const wpRes = await db.execute({ sql: 'SELECT * FROM worker_profiles WHERE user_id = ?', args: [workerId] });
        const profile = wpRes.rows[0] || {};

        const contribsRes = await db.execute({
            sql: `SELECT p.*, s.name as service_name, sr.location
                  FROM payments p
                  JOIN service_requests sr ON p.service_request_id = sr.id
                  JOIN services s ON sr.service_id = s.id
                  WHERE p.worker_id = ? AND p.status = 'SUCCESS'
                  ORDER BY p.id DESC`,
            args: [workerId]
        });

        const claimsRes = await db.execute({
            sql: `SELECT * FROM welfare_claims WHERE worker_id = ? ORDER BY id DESC`,
            args: [workerId]
        });

        const totalWelfareAccumulated = contribsRes.rows.reduce((sum, r) => sum + Number(r.society_welfare_share || 0), 0);

        res.json({
            success: true,
            data: {
                worker_id: Number(workerId),
                welfare_balance: Number(profile.welfare_balance || totalWelfareAccumulated).toFixed(2),
                policy_number: `POL-COOP-HEALTH-2026-${workerId.toString().padStart(4, '0')}`,
                policy_coverage_amount: 200000.00,
                total_accumulated_credits: totalWelfareAccumulated.toFixed(2),
                recent_contributions: contribsRes.rows,
                claims: claimsRes.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/welfare/claims', async (req, res) => {
    const { worker_id, claim_type, amount, document_proof, description } = req.body;
    if (!worker_id || !claim_type || !amount || !description) {
        return res.status(400).json({ success: false, message: 'Missing required claim fields' });
    }
    try {
        const insRes = await db.execute({
            sql: `INSERT INTO welfare_claims (worker_id, claim_type, amount, document_proof, description, status) 
                  VALUES (?, ?, ?, ?, ?, 'PENDING')`,
            args: [worker_id, claim_type, Number(amount), document_proof || 'DOC-MED-PROOF-UPLOADED', description]
        });
        const claimId = Number(insRes.lastInsertRowid);
        res.json({ success: true, message: 'Welfare and healthcare claim filed successfully', data: { claimId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/welfare/claims', async (req, res) => {
    try {
        const claimsRes = await db.execute(`
            SELECT wc.*, u.name as worker_name, u.phone as worker_phone, u.gender as worker_gender,
                   wp.welfare_balance, wp.experience_years
            FROM welfare_claims wc
            JOIN users u ON wc.worker_id = u.id
            LEFT JOIN worker_profiles wp ON u.id = wp.user_id
            ORDER BY wc.id DESC
        `);
        res.json({ success: true, data: claimsRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/welfare/claims/:claimId/review', async (req, res) => {
    const { claimId } = req.params;
    const { status, reviewed_by } = req.body;
    try {
        await db.execute({
            sql: `UPDATE welfare_claims 
                  SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, 
                      disbursed_at = CASE WHEN ? = 'APPROVED' THEN CURRENT_TIMESTAMP ELSE disbursed_at END
                  WHERE id = ?`,
            args: [status, reviewed_by || null, status, claimId]
        });
        res.json({ success: true, message: `Claim status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= EMERGENCY URGENT BOOKING & SOS =================
app.post('/api/requests/emergency', async (req, res) => {
    const { customer_id, service_id, description, location, price, urgency_level } = req.body;
    try {
        const reqRes = await db.execute({
            sql: `INSERT INTO service_requests (customer_id, service_id, description, location, price, advance_paid, balance_paid, payment_status, status, booking_type, urgency_level) 
                  VALUES (?, ?, ?, ?, ?, 100, 0, 'ADVANCE_PAID', 'EMERGENCY_BROADCAST', 'EMERGENCY', ?)`,
            args: [customer_id, service_id || 1, description || 'Urgent Emergency Request', location, price || 499, urgency_level || 'CRITICAL']
        });
        const requestId = Number(reqRes.lastInsertRowid);

        // Broadcast to all WebSocket clients
        const payload = {
            type: 'EMERGENCY_BROADCAST',
            data: {
                requestId,
                location,
                urgency_level: urgency_level || 'CRITICAL',
                description,
                timestamp: new Date().toISOString()
            }
        };

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });

        res.json({
            success: true,
            message: '🚨 Priority Emergency broadcast dispatched to all available nearby technicians',
            data: { requestId, status: 'EMERGENCY_BROADCAST' }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/requests/:requestId/sos', async (req, res) => {
    const { requestId } = req.params;
    const { user_id, user_role, latitude, longitude, notes } = req.body;
    try {
        const sosRes = await db.execute({
            sql: `INSERT INTO sos_alerts (service_request_id, user_id, user_role, latitude, longitude, status, notes) 
                  VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)`,
            args: [requestId, user_id, user_role || 'CUSTOMER', latitude || 12.9716, longitude || 77.5946, notes || 'Emergency SOS Button Triggered']
        });
        const sosId = Number(sosRes.lastInsertRowid);

        // Broadcast SOS
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'SOS_PANIC_ALERT',
                    data: { sosId, requestId, user_id, user_role, notes, timestamp: new Date().toISOString() }
                }));
            }
        });

        res.json({ success: true, message: '🚨 Emergency SOS alert registered. Federation safety desk dispatched.', data: { sosId } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/sos-alerts', async (req, res) => {
    try {
        const alertsRes = await db.execute(`
            SELECT sa.*, u.name as user_name, u.phone as user_phone, sr.location
            FROM sos_alerts sa
            JOIN users u ON sa.user_id = u.id
            LEFT JOIN service_requests sr ON sa.service_request_id = sr.id
            ORDER BY sa.id DESC
        `);
        res.json({ success: true, data: alertsRes.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ================= AI DEMAND FORECASTING & REBALANCING =================
app.get('/api/admin/analytics/demand-forecast', async (req, res) => {
    try {
        const forecastRes = await db.execute(`SELECT * FROM demand_forecasts ORDER BY current_demand_index DESC`);
        const totalRec = forecastRes.rows.reduce((sum, r) => sum + r.recommended_workers, 0);
        const totalAct = forecastRes.rows.reduce((sum, r) => sum + r.active_workers, 0);
        const deficit = Math.max(0, totalRec - totalAct);

        res.json({
            success: true,
            data: {
                forecasts: forecastRes.rows,
                summary: {
                    city_average_demand_index: 84,
                    peak_season: 'Summer Pre-Monsoon Cycle',
                    total_recommended_workforce: totalRec,
                    total_active_workforce: totalAct,
                    workforce_deficit: deficit,
                    top_surge_zone: forecastRes.rows[0] ? forecastRes.rows[0].district_zone : 'Koramangala'
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/analytics/rebalance', async (req, res) => {
    const { zone_id, transfer_count } = req.body;
    try {
        await db.execute({
            sql: `UPDATE demand_forecasts SET active_workers = active_workers + ? WHERE id = ?`,
            args: [Number(transfer_count) || 2, zone_id || 1]
        });
        res.json({
            success: true,
            message: 'Workforce rebalancing action executed. Additional cooperative technicians deployed to high-surge zone.'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const custRes = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'");
        const workRes = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'WORKER'");
        const pendRes = await db.execute("SELECT COUNT(*) as count FROM worker_profiles WHERE verification_status = 'PENDING'");
        const verRes = await db.execute("SELECT COUNT(*) as count FROM worker_profiles WHERE verification_status = 'VERIFIED'");
        const actRes = await db.execute("SELECT COUNT(*) as count FROM service_requests WHERE status != 'COMPLETED'");
        const compRes = await db.execute("SELECT COUNT(*) as count FROM service_requests WHERE status = 'COMPLETED'");
        const payRes = await db.execute("SELECT COALESCE(SUM(amount), 0) as total_volume, COALESCE(SUM(worker_share), 0) as total_wages FROM payments WHERE status = 'SUCCESS'");
        const dispRes = await db.execute("SELECT COUNT(*) as count FROM complaints_disputes WHERE status = 'OPEN'");

        res.json({
            success: true,
            data: {
                totalCustomers: custRes.rows[0].count,
                totalWorkers: workRes.rows[0].count,
                pendingWorkers: pendRes.rows[0].count,
                verifiedWorkers: verRes.rows[0].count,
                activeRequests: actRes.rows[0].count,
                completedJobs: compRes.rows[0].count,
                totalVolume: payRes.rows[0].total_volume,
                totalWages: payRes.rows[0].total_wages,
                openDisputes: dispRes.rows[0].count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

let currentPort = Number(PORT);

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        currentPort += 1;
        console.log(`Port in use, retrying on http://localhost:${currentPort}...`);
        setTimeout(() => server.listen(currentPort), 200);
    } else {
        console.error('Server error:', err);
    }
});

server.listen(currentPort, () => {
    console.log(`CoopServe platform & WebSocket server running on http://localhost:${currentPort}`);
});

module.exports = { app, server };

