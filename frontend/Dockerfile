FROM node

WORKDIR /app

RUN npm install -g create-react-app && \
    create-react-app findchat-react

ADD . /app/findchat-react/

RUN cd findchat-react && npm install

EXPOSE 3000

CMD cd /app/findchat-react && npm start

