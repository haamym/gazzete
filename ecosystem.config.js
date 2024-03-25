module.exports = {
  apps: [
    {
      name: "gazzete",
      script: "index.js",
      //  configuration
      autorestart: false, // Important: Disable autorestart for cron jobs
      cron_restart: "*/2 * * * *", // change to "0 20 * * *" - "At 20:00" (8 PM) Maldives time (UTC+5)
      env: {
        NODE_ENV: "production",
        TZ: "Indian/Maldives", //  timezone to Maldives Time
      },
    },
  ],
};
