# Run our services
Services=("su-accounts" "su-users" "su-questions" "su-answers" "su-search" "su-mail" "su-media" "qu-questions" "qu-delete-questions" "qu-answers")
for val1 in ${Services[*]}; do
        cd "/home/ubuntu/smores-underflow/current/$val1"
        pm2 start dist/server.js --name $val1 --watch
done
echo ""