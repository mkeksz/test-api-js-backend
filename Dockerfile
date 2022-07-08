FROM node:18.3.0

ADD . /opt/app
WORKDIR /opt/app

ENV AUTH_USERNAME ''
ENV AUTH_PASSWORD ''
ENV DATABASE_URL 'mongodb://root:1234@mongo-db:27017/test?authSource=admin'
ENV JWT_KEY ''

EXPOSE 2114

RUN npm install --omit=dev
CMD npx prisma@^4.0.0 db push && npm start
