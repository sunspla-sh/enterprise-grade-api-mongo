#base for our image, based on buildpack-deps, based on Debian Linux
FROM node:lts

#create app directory
WORKDIR /opt/api-example

#install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

#build javascript from typescript
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=8192 npm run build

#tell docker which port will be used (not published)
EXPOSE 3000

#default env file
ENV ENV_FILE=config/.env.prod

#run this app when a container is launched
CMD [ "node", "-r", "tsconfig-paths/register", "bin/app.js"]