
const { db } = require('./db');

// In-memory reference to active WebSocket connections for live push
let wsBroadcaster = null;

function setWebSocketBroadcaster(broadcaster) {
    wsBroadcaster = broadcaster;
}

/**
 * Dispatch notification through SMS (Twilio hook), Push (FCM), and in-app DB log
 */
async function dispatchNotification({ userId, title, message, channel = 'IN_APP', recipientPhone = '', metadata = {} }) {
    try {
        const metaStr = typeof metadata === 'object' ? JSON.stringify(metadata) : metadata;
        
        // 1. Insert into database notifications log
        const res = await db.execute({
            sql: 'INSERT INTO notifications (user_id, title, message, channel, recipient_phone, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [userId, title, message, channel, recipientPhone || '', 'DELIVERED', metaStr]
        });
        const notifId = Number(res.lastInsertRowid);

        const notifObj = {
            id: notifId,
            user_id: userId,
            title,
            message,
            channel,
            recipient_phone: recipientPhone,
            status: 'DELIVERED',
            metadata: metaStr,
            created_at: new Date().toISOString()
        };

        // 2. Real-Time WebSocket broadcast if connected
        if (wsBroadcaster) {
            wsBroadcaster(userId, { type: 'NOTIFICATION', data: notifObj });
        }

        // 3. SMS Hook (Twilio Simulation / Webhook)
        if (channel.includes('SMS') || channel === 'ALL') {
            console.log('[TWILIO SMS DISPATCH] To: ' + (recipientPhone || 'User #' + userId) + ' | Message: "' + message + '" | Status: 200 OK (SID: SM' + Math.random().toString(36).substring(2, 12).toUpperCase() + ')');
        }

        // 4. Push Hook (FCM Simulation)
        if (channel.includes('PUSH') || channel === 'ALL') {
            console.log('[FCM PUSH DISPATCH] User: #' + userId + ' | Title: "' + title + '" | Body: "' + message + '" | Status: Success');
        }

        return notifObj;
    } catch (err) {
        console.error('Error dispatching notification:', err);
        return null;
    }
}

/**
 * Notification Trigger: New Service Request assigned to Worker
 */
async function notifyNewServiceRequest(worker, request, serviceName, customer) {
    const title = '🚨 New Service Request Assigned';
    const message = '[CoopServe Alert] New booking #' + request.id + ' for ' + serviceName + ' at ' + request.location + '. Customer: ' + customer.name + ' (' + (customer.phone || 'Verified') + '). Open portal to accept.';
    
    return await dispatchNotification({
        userId: worker.id || worker.user_id,
        title,
        message,
        channel: 'SMS_TWILIO',
        recipientPhone: worker.phone || '+919876501234',
        metadata: { requestId: request.id, event: 'NEW_REQUEST', customerId: customer.id }
    });
}

/**
 * Notification Trigger: Worker Updates Service Request Status
 */
async function notifyStatusUpdate(customer, request, status, worker) {
    const statusLabels = {
        'ACCEPTED': 'accepted by worker',
        'WORKER_ON_THE_WAY': 'Worker is on the way to your location',
        'STARTED': 'Service work has started',
        'COMPLETED': 'Work marked COMPLETED. Please complete post-service settlement and rating.'
    };
    const title = '🔔 Service Update: #' + request.id;
    const message = '[CoopServe] Status for your ' + (request.service_name || 'service') + ' request is now "' + (statusLabels[status] || status) + '". Worker: ' + worker.name + '.';
    
    return await dispatchNotification({
        userId: customer.id || customer.user_id,
        title,
        message,
        channel: 'PUSH_FCM',
        recipientPhone: customer.phone || '+919812345678',
        metadata: { requestId: request.id, event: 'STATUS_UPDATE', status, workerId: worker.id }
    });
}

/**
 * Notification Trigger: Payment and Transparent Wage Split Received
 */
async function notifyPaymentSuccess(customer, worker, payment, request) {
    // Notify Worker of direct wage split + welfare contribution
    await dispatchNotification({
        userId: worker.id || worker.user_id,
        title: '💰 Wage & Welfare Payout Credited',
        message: '[CoopServe Payout] ₹' + Number(payment.worker_share).toFixed(2) + ' direct wage credited to your cooperative bank account for Job #' + request.id + '. (Welfare Fund: ₹' + Number(payment.society_welfare_share).toFixed(2) + '). Txn: ' + payment.transaction_id,
        channel: 'SMS_TWILIO',
        recipientPhone: worker.phone || '+919876501234',
        metadata: { requestId: request.id, event: 'PAYMENT_CREDITED', txnId: payment.transaction_id }
    });

    // Notify Customer of receipt & transparent split confirmation
    await dispatchNotification({
        userId: customer.id || customer.user_id,
        title: '🧾 Payment Confirmed',
        message: '[CoopServe Receipt] Payment of ₹' + Number(payment.amount).toFixed(2) + ' confirmed for Job #' + request.id + '. Thank you for supporting verified cooperative labor!',
        channel: 'PUSH_FCM',
        recipientPhone: customer.phone || '+919812345678',
        metadata: { requestId: request.id, event: 'PAYMENT_RECEIPT', txnId: payment.transaction_id }
    });
}

/**
 * Notification Trigger: Direct Chat Message Received
 */
async function notifyChatMessage(recipient, sender, messageText, requestId) {
    const preview = messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText;
    return await dispatchNotification({
        userId: recipient.id || recipient.user_id,
        title: '💬 New Message from ' + sender.name,
        message: 'Request #' + requestId + ': "' + preview + '"',
        channel: 'IN_APP',
        recipientPhone: recipient.phone || '',
        metadata: { requestId, event: 'CHAT_MESSAGE', senderId: sender.id }
    });
}

module.exports = {
    setWebSocketBroadcaster,
    dispatchNotification,
    notifyNewServiceRequest,
    notifyStatusUpdate,
    notifyPaymentSuccess,
    notifyChatMessage
};
