FROM node:16
WORKDIR /app
COPY . /app

# 构建镜像时，一般用于做一些系统配置，安装必备的软件。可有多个 RUN 命令
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && echo 'Asia/Tokyo' >/etc/timezone
RUN npm set registry https://registry.npm.taobao.org
RUN npm install
#全局安装PM2
RUN npm install -g pm2 

# 启动容器时，只能有一个 CMD命令
# npx pm2 log 会找有没有pm2 这个包，如果没有就自动下载pm2，然后执行pm2 log 命令
# npm run prd-dev 使用的是pm2 来启动服务器，pm2 启动的服务器是后台运行。cmd控制台就不会被占据
# cmd控制台就看不到任何信息。为了让控制台被阻塞，
# 使用npx pm2 log 的作用就是让该container的cmd控制台不断有log 输出的感觉，
CMD npm run prd-dev && npx pm2 log