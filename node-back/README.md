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

Если запускаем на своем машине
```yaml
host: 'localhost:8004'
```

Запускаем "asterisk-reactor-node"
```
docker run \
  --name asterisk-reactor-node \
  -v $PWD:/asterisk-reactor-node \
  -w /asterisk-reactor-node \
  --publish=8004:8004 \
  --env="ARI_HOST=192.168.16.14" \
  --env="ARI_USER=aster" \
  --env="ARI_PASS=INSERT_PASS_HERE" \
  --env="DB_HOST=192.168.26.17" \
  --env="DB_USER=admin" \
  --env="DB_PASS=INSERT_PASS_HERE" \
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