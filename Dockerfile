FROM node:alpine
# setup ENV
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PORT=3000
WORKDIR /app

RUN --mount=type=cache,target=/root/.npm,id=npm_cache \
    npm install -g pnpm &&\
    pnpm config set store-dir $PNPM_HOME
RUN --mount=type=cache,target=/pnpm,id=pnpm_cache \
    pnpm add -g typescript ts-node @nestjs/cli
COPY prisma/ ./prisma/
COPY src src
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml prisma.config.ts tsconfig.build.json tsconfig.json  ./
COPY .docker.env .env
RUN --mount=type=cache,target=/pnpm,id=pnpm_cache \
    --mount=type=cache,target=/app/node_modules/,id=app_node_modules \
    pnpm install &&\
    pnpm run db:generate &&\
    pnpm run build

RUN --mount=type=cache,target=/pnpm,id=pnpm_cache \
    pnpm install -P

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]