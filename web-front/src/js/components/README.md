# asterisk-react-component

## Overview
React components for Asterisk interaction.
Works with backend API - [asterisk-reactor](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/node-back).

## Usage
**specUrl** - path to [asterisk-reactor](https://github.com/ars-anosov/asterisk-stasis-react/tree/master/node-back) spec-file

``` js
import { OpenApiSwagger, HZ123 } from 'asterisk-react-component'

window.localStorage.setItem('token', 'test')

const specUrl = 'http://localhost:8004/spec/swagger.json'
const swg = new OpenApiSwagger(specUrl)

swg.connect((client, err) => {
  if (err) {
    ReactDOM.render(
      <div className='std-win'>no spec - <a href={specUrl}>{specUrl}</a> !</div>,
      document.getElementById('root')
    )
  }
  else {
    ReactDOM.render(
      <div>
        <HostGraph swgClient={client} HZ123='HZ123 component' />
      </div>,
      document.getElementById('root')
    )
  }
})
```

## Dependencies
- [swagger-js](https://github.com/swagger-api/swagger-js): for backend API [zabbix-reactor](https://github.com/ars-anosov/zabbix-react/tree/master/node-back) in [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification) format