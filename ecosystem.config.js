// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: 'seafogai', // 应用名称
        script: 'dist/main.js', // 启动文件
        instances: 'max', // 启动实例数，'max' 表示使用所有可用的 CPU 核心
        exec_mode: 'cluster', // 使用集群模式
        env: {
          NODE_ENV: 'production', // 设置环境变量
        },
        env_development: {
          NODE_ENV: 'development', // 开发环境变量
        },
      },
    ],
  };