FROM node:18

WORKDIR /app

# copy only app file
COPY app.js .

EXPOSE 3000
CMD ["node", "app.js"]
