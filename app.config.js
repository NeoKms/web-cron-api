module.exports = {
  apps: [
    {
      error_file: '/var/log/pm2_err.log',
      out_file: '/var/log/pm2_out.log',
      name: 'web-cron-api',
      script: 'npm',
      watch: false,
      args: 'run start:prod',
      cwd: '/var/www/app',
    },
  ],
};
