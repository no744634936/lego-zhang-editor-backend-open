-- docker-compose 启动 mysql 时的初始化代码

select "init start...";

-- 设置 宿主机的root 可以通过3035端口进行访问container里的mysql数据库
use mysql;
SET SQL_SAFE_UPDATES=0; -- 解除安全模式，测试环境，没关系
update user set host='%' where user='root';
flush privileges;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'xxxxxxxxxx'; -- 密码参考 docker-compose.yml
flush privileges;

select "init end...";