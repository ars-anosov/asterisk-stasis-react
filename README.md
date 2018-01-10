# asterisk-stasis-react



## Обзор
Проект по созданию React-компонент для работы с Asterisk.
Компоненты общаяются с API в соответствии с [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification) спецификацией, на базе которой можно собрать как API-сервер, так и SDK-клиента.


### Компоненты
[<img src="https://github.com/npm/logos/blob/7fb0bc425e0dac1bab065217c4ed595594448db4/npm-transparent.png" height="20" alt="npm">](https://www.npmjs.com)

[asterisk-react-component](https://www.npmjs.com/package/asterisk-react-component)

### Примеры


## Цель
1. Предоставить FrontEnd в виде [React-компоненты](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/web-front)
2. Взаимодействие Front-Back свести до простейших REST-запросов
3. Сосредоточить всю логику взаимодействия с Asterisk на BackEnd - [asterisk-reactor](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/node-back)

## Установка / Использование

### 1. Back: asterisk-stasis-reactor
OpenAPI-сервер обрабатывает REST-запросы от React-компонент.
Общается с Asterisk-ARI.

Собираю в Docker-контейнерах на машине с IP=192.168.13.97.

#### 1.1 В Docker-контейнере NodeJS
```
docker build -t 'asterisk-reactor-node:latest' github.com/ars-anosov/asterisk-stasis-reactt#:node-back

docker run \
  --name asterisk-reactor-node \
  --publish=8004:8004 \
  --env="ARI_IP=192.168.16.14" \
  --env="ARI_USER=INSERT_USERNAME_HERE" \
  --env="ARI_PASS=INSERT_PASSWORD_HERE" \
  -it \
  asterisk-reactor-node:latest
```
Выскочить из контейнера : Ctrl+P+Q

- WEB-интерфейс для тестовых запросов через Swagger-UI - [192.168.13.97:8004/spec-ui/](http://192.168.13.97:8004/spec-ui/)
- OpenAPI-Spec файл доступен - [192.168.13.97:8004/spec/swagger.json](http://192.168.13.97:8004/spec/swagger.json)
- API принимает REST-запросы - [192.168.13.97:8004/v2api](http://192.168.13.97:8004/v2api/)

В поле "token" вписываем "test".

### 2. Front: asterisk-react-component

#### 2.1. Через gulp в Docker-контейнере NodeJS
```
docker build -t 'asterisk-react-front:latest' github.com/ars-anosov/asterisk-stasis-react#:web-front

docker run \
  --name asterisk-react-front \
  --publish=8005:8005 \
  -it \
  asterisk-react-front:latest
```
Выскочить из контейнера : Ctrl+P+Q

Живые компоненты - [192.168.13.97:8005](http://192.168.13.97:8005/)

#### 2.2. В своем React bundler
Например через [create-react-app](https://reactjs.org/tutorial/tutorial.html)
```bash
mkdir ~/react-app && cd ~/react-app

docker run \
  --name react-app \
  --publish=3000:3000 \
  -v $PWD:/my-app \
  -w / \
  -it \
  node:8 bash

# Дальше все действия в контейнере:
npm install -g create-react-app
create-react-app my-app
cd my-app
rm -f src/*

yarn add asterisk-react-component

# Редактируем файлы. См. ниже.
touch src/index.js
touch src/index.css

npm start
```

- Содержимое **index.js**

```js
import React from 'react';
import ReactDOM from 'react-dom'

import { OpenApiSwagger, HZ123 } from 'asterisk-react-component'
import './index.css';

window.localStorage.setItem('token', 'test')

const specUrl = 'http://192.168.13.97:8004/spec/swagger.json'
const swg = new OpenApiSwagger(specUrl)

swg.connect((client, err) => {
  if (err) {
    // Error actions
  }
  else {
    ReactDOM.render(
      <div>
        <HZ123 swgClient={client} headerTxt='HZ123 component' />
      </div>,
      document.getElementById('root')
    )
  }
})
```

- Содержимое **index.css** копируем отсюда [examples/css](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/examples/css)

Тыкаем компоненты на локальном web-сервере - [192.168.13.97:3000](http://192.168.13.97:3000/)

## Пилим проект

### asterisk-reactor
- [node-back](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/node-back): Swagger-сервер "asterisk-reactor-node": 

### asterisk-react-component
- [web-front](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/web-front): livereload-сервер с компонентами
- [web-front/src/js/components](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/web-front/src/js/components): содержимое npm пакета "asterisk-react-component"

### OpenAPI spec - файл

#### [swagger-editor](https://github.com/swagger-api/swagger-editor)
```
docker run \
  --publish=8001:8080 \
  --name=swagger-editor \
  swaggerapi/swagger-editor
```
Пишем файл спецификации - [192.168.13.97:8001](http://192.168.13.97:8001/), там же генерим Server API / Client SDK
