FROM node:alpine
# setup ENV
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PORT=3000
WORKDIR /app

RUN --mount=type=cache,target=/root/.npm,id=npm_cache \
    npm install -g pnpm &&\
    pnpm config set store-dir $PNPM_HOME

COPY package.json pnpm-workspace.yaml ./

RUN --mount=type=cache,target=/pnpm,id=pnpm_cache \
    pnpm install --production

COPY src ./src
COPY generated ./generated

EXPOSE 3000

# CMD ["pnpm", "run", "start:dev"]