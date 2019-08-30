FROM node:10.16.3

RUN mkdir -p /app
ADD package.json /app
WORKDIR /app
RUN npm install --verbose
ENV NODE_PATH=/app/node_modules

COPY . /app/
EXPOSE 3000

CMD node /app/bin/www
