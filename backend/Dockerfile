# build your project
FROM node:16-alpine as build
COPY package* .
RUN npm ci
WORKDIR /build
COPY . .
RUN npm run build:release

# only place your bundle in the final container image
FROM node:16-alpine
COPY --from=build /build/dist/server.js /app/server.js
CMD ["node", "/app/server.js"]
