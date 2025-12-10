module.exports = {
  apps: [
    {
      name: 'frontend-lanube',
      cwd: '/var/www/clients/client0/web10/web/frontend-lanube',
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      pre_start: 'npm run build'
    }
  ]
};
