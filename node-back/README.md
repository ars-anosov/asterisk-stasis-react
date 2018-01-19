# asterisk-reactor-node

## Обзор
- Nodejs сервер собран при помощи [swagger-codegen](https://github.com/swagger-api/swagger-codegen)
- Для общения с Asterisk-ARI использует модуль [ari-client](https://github.com/asterisk/node-ari-client)
- Для общения с DB Mysql использует модуль [mysql](https://github.com/mysqljs/mysql)

## Строим среду разработки

### Node:8
В Docker-контейнер будет прокинута директория "node-back": переходим в нее.
```
cd node-back
```

Проверяем поле "host" в [api/asterisk-api.yaml](https://github.com/ars-anosov/asterisk-stasis-react/blob/master/node-back/api/asterisk-api.yaml)

Прописываем IP-адрес своей машины
```yaml
host: '192.168.13.97:8004'
```

Запускаем "asterisk-reactor-node"
```
docker run \
  --name asterisk-reactor-node \
  -v $PWD:/asterisk-reactor-node \
  -w /asterisk-reactor-node \
  --publish=8004:8004 \
  --publish=8006:8006 \
  --env="ARI_HOST=192.168.16.14" \
  --env="ARI_USER=INSERT_USERNAME_HERE" \
  --env="ARI_PASS=INSERT_PASSWORD_HERE" \
  --env="DB_HOST=192.168.26.17" \
  --env="DB_USER=INSERT_USERNAME_HERE" \
  --env="DB_PASS=INSERT_PASSWORD_HERE" \
  -it \
  node:8 bash
```

Дальше все действия внутри контейнера.

```
npm install
node index.js $ARI_HOST $ARI_USER $ARI_PASS $DB_HOST $DB_USER $DB_PASS
```
Выскочить из контейнера : Ctrl+P+Q

## Asterisk Настройки

### ARI
Необходимо включить Asterisk-ARI интерфейс

### Database
БД Asterisk в которой всякое