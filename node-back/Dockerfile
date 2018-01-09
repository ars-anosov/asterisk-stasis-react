# Version: 1.0.0

FROM node:8

MAINTAINER Arseniy Anosov <ars.anosov@gmail.com>

ENV ARI_HOST=undefined
ENV ARI_USER=undefined
ENV ARI_PASS=undefined
ENV DB_HOST=undefined
ENV DB_USER=undefined
ENV DB_PASS=undefined

RUN git clone https://github.com/ars-anosov/asterisk-stasis-react.git && \
  cd asterisk-stasis-react/node-back && \
  npm install

WORKDIR /asterisk-stasis-react/node-back

CMD node index.js $ARI_HOST $ARI_USER $ARI_PASS $DB_HOST $DB_USER $DB_PASS