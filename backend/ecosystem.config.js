// ─────────────────────────────────────────────────────────────────────────────
// System Profile  :  24 GB RAM  |  10 CPU Cores (logical)
// Worker count    :  8  (leaves 2 cores free for OS / DB / frontend)
// Heap per worker :  2 GB  →  8 workers × 2 GB = 16 GB max heap
// Restart ceiling :  2.5 GB per worker  (handles burst before restart)
// Reserved for OS :  ~8 GB  (safe headroom)
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  apps: [
    {
      // ── Identity ─────────────────────────────────────────────
      name        : 'onscreen-valuation-backend',
      script      : 'app.js',

      // ── Cluster / Scaling ─────────────────────────────────────
      instances   : 8,              // 8 of 10 cores (2 free for OS & DB)
      exec_mode   : 'cluster',      // load balance across all workers

      // ── Memory & Node Tuning ──────────────────────────────────
      // 2 GB heap per worker; expose-gc lets Node free memory proactively
      node_args           : '--max-old-space-size=2048 --expose-gc',
      max_memory_restart  : '2500M', // restart a worker that exceeds 2.5 GB

      // ── Stability & Auto-restart ──────────────────────────────
      watch               : false,
      autorestart         : true,
      restart_delay       : 4000,   // 4 s back-off before restarting (ms)
      max_restarts        : 15,     // allow more retries for heavy workloads
      min_uptime          : '15s',  // stable if alive > 15 s

      // ── Logging ───────────────────────────────────────────────
      output          : './logs/pm2-out.log',
      error           : './logs/pm2-error.log',
      log_date_format : 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs      : true,       // one log file for all workers

      // ── Graceful Shutdown ─────────────────────────────────────
      kill_timeout         : 10000, // 10 s — allows PDF / file ops to finish
      listen_timeout       : 12000, // 12 s for app to become ready
      shutdown_with_message: true,

      // ── Environment : Development ─────────────────────────────
      env: {
        NODE_ENV         : 'development',
        PORT             : 5000,
        UV_THREADPOOL_SIZE: 64,     // more threads for file / DB / PDF I/O
      },

      // ── Environment : Production ──────────────────────────────
      env_production: {
        NODE_ENV         : 'production',
        PORT             : 5000,
        UV_THREADPOOL_SIZE: 64,     // handles concurrent PDF & file uploads
      },
    },
  ],
};
// cd backend
// pm2 reload ecosystem.config.js --env production
// pm2 start ecosystem.config.js --env production

// # Start in development
// pm2 start ecosystem.config.js

// # Reload with zero downtime (production only)
// pm2 reload ecosystem.config.js --env production

// # Save & enable on system reboot
// pm2 save
// 
