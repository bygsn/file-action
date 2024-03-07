#!/bin/bash

#git add .
#git commit -m "Deploy"
#git push github master
#ssh bygsn "cd /srv/file-action; git pull; exit;"

pnpm build
test -e dist.tar.gz && rm -f dist.tar.gz
tar -zcf dist.tar.gz dist
#rsync 上传文件 windows用不了 只有mac才能用 或者换成nodejs来写 就可以上传文件了
rsync dist.tar.gz bygsn:/srv/file-action/
rm -f dist.tar.gz

ssh bygsn "cd /srv/file-action && tar -zxf dist.tar.gz; exit;"
