FROM node

COPY package.json /tmp/
RUN cd /tmp && npm update --production

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/logs
RUN cp -rf /tmp/* /usr/src/app

WORKDIR /usr/src/app
COPY . /usr/src/app

EXPOSE 8000

CMD npm start
