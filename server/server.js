const app = require('./src/app');
const PORT = process.env.PORT || 5000;
const startOrderCleanupJob = require('./src/cron/orderCleanup');
app.listen(PORT, () => {
  startOrderCleanupJob();
  console.log(`Server listening on port ${PORT}`);
});
