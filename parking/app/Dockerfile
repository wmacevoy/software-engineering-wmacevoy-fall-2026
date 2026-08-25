FROM node:20-alpine

# The build context is parking/, not app/ — see docker-compose.yml. The layout
# inside the image mirrors the repository so that a future require('../identity')
# resolves the same way in both places.
WORKDIR /srv/app

COPY app/package.json ./
RUN npm install --omit=dev

COPY app/ ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
