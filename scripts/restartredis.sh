#/bin/bash
killall redis-server

for port in 7000 7001 7002 7003 7004 7005
do
        cd "/home/ubuntu/clusters/$port"
        rm redis-server.log
        ./redis-server redis.conf
done

ps -e | grep redis-server