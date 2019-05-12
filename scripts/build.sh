# Autobuild our instance
Services=("su-accounts" "su-users" "su-questions" "su-answers" "su-search" "su-mail" "su-media" "qu-questions" "qu-delete-questions" "qu-answers")
for val1 in ${Services[*]}; do
        cd "/home/ubuntu/smores-underflow/current/$val1"
        npm run build
done
echo ""