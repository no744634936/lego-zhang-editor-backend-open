/**
 * @description pm2 app 配置信息
 */

 const os = require('os')

 const cpuCoreLength = os.cpus().length // CPU 几核
 
 module.exports = {
     name: 'lego-zhang-editor-backend',
     script: 'bin/www',
     // watch: true,
     // ignore_watch: ['node_modules', '__test__', 'logs'],
     instances: cpuCoreLength,
     error_file: './logs/err.log',
     out_file: './logs/out.log',
     log_date_format: 'YYYY-MM-DD HH:mm:ss Z', // Z 表示使用当前电脑的时区的时间格式
     combine_logs: true, // 多个实例，合并日志
     max_memory_restart: '300M', // 内存占用超过 300M ，则重启使用 pm2 monite 0来查看,进程初始占内存是多少，然后乘以3，4，就可以
 }