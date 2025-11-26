const cron = require('node-cron');
const { db } = require('../config/firebaseAdmin');

const startOrderCleanupJob = () => {
  cron.schedule('*/10 * * * *', async () => {
    console.log('⏳ [CRON] Running cleanup job for pending orders...');
    const cutoffTime = Date.now() - 30 * 60 * 1000; 
    try {
      const ref = db.ref('pendingOrders');
      const snapshot = await ref.orderByChild('createdAt').endAt(cutoffTime).once('value');

      if (snapshot.exists()) {
        const updates = {};
        let count = 0;
        
        snapshot.forEach((child) => {
          updates[child.key] = null;
          count++;
        });
        
        await ref.update(updates);
      } 
    } catch (error) {
      console.error('Error cleaning up pending orders:', error);
    }
  });
};

module.exports = startOrderCleanupJob;