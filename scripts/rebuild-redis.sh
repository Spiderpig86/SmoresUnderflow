#/bin/bash
killall redis-server

for port in 7000 7001 7002 7003 7004 7005
do
        cd "/home/ubuntu/clusters/$port"
        rm appendonly.aof dump.rdb nodes.conf
done