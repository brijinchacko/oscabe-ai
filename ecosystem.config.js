module.exports = {
  apps: [
    // Main Next.js application
    {
      name: "oscabe-ai",
      script: "node_modules/.bin/next",
      args: "start -p 3012",
      cwd: "/home/deploy/oscabe-ai",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3012",
        TZ: "Europe/London",
      },
    },

    // Cron: Sync outreach metrics (every hour)
    {
      name: "oscabe-cron-metrics",
      script: "scripts/cron-runner.sh",
      args: "sync-metrics",
      cwd: "/home/deploy/oscabe-ai",
      cron_restart: "0 * * * *",
      autorestart: false,
      watch: false,
    },

    // Cron: Sync replies from Instantly (every 5 minutes)
    {
      name: "oscabe-cron-replies",
      script: "scripts/cron-runner.sh",
      args: "sync-replies",
      cwd: "/home/deploy/oscabe-ai",
      cron_restart: "*/5 * * * *",
      autorestart: false,
      watch: false,
    },

    // Cron: Domain health check (every 6 hours)
    {
      name: "oscabe-cron-domain-health",
      script: "scripts/cron-runner.sh",
      args: "domain-health",
      cwd: "/home/deploy/oscabe-ai",
      cron_restart: "0 */6 * * *",
      autorestart: false,
      watch: false,
    },

    // Cron: Weekly lead discovery (Monday 8am)
    {
      name: "oscabe-cron-discover",
      script: "scripts/cron-runner.sh",
      args: "weekly-discover",
      cwd: "/home/deploy/oscabe-ai",
      cron_restart: "0 8 * * 1",
      autorestart: false,
      watch: false,
    },

    // Cron: Daily digest email (daily 8am)
    {
      name: "oscabe-cron-digest",
      script: "scripts/cron-runner.sh",
      args: "daily-digest",
      cwd: "/home/deploy/oscabe-ai",
      cron_restart: "0 8 * * *",
      autorestart: false,
      watch: false,
    },
  ],
};
