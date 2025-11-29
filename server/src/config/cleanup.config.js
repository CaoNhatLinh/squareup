module.exports = {
  invitation: {
    EXPIRY_TIME: 30 * 60 * 1000,
    CRON_SCHEDULE: "*/5 * * * *",
    CLEANUP_INTERVAL: 5 * 60 * 1000,
    AUTO_DELETE_EXPIRED: true,
    RETENTION_TIME: 7 * 24 * 60 * 60 * 1000,
    CLEANUP_STATUSES: {
      pending: true,
      expired: true,
      cancelled: true,
      accepted: false,
    },
  },
  order: {
    ENABLED: true,
    PENDING_ORDER_TTL: 24 * 60 * 60 * 1000,
    CRON_SCHEDULE: "0 0 * * *",
  },
  general: { VERBOSE_LOGGING: true, TIMEZONE: "vi-VN" },
};
