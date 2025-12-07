import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "./prisma-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "@/common/schema/env";
export const createPrismaClient = ({ DATABASE_URL }: { DATABASE_URL: string }) => {
  const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
    max: 20,
  });
  const prisma = new PrismaClient({ adapter, log: [] }).$extends({
    query: {
      $allModels: {
        async aggregate({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async count({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirst({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findFirstOrThrow({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findMany({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findUnique({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async findUniqueOrThrow({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async groupBy({ args, query }) {
          if (args.where) {
            if (args.where != undefined && "deletedAt" in args.where) {
              return query(args);
            }
            args.where = { deletedAt: null, ...args.where };
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
        async updateMany({ args, query }) {
          if (args.where != undefined) {
            if ("deletedAt" in args.where) {
              return query(args);
            }
            args.where = { deletedAt: null, ...args.where };
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async updateManyAndReturn({ args, query }) {
          if (args.where != undefined) {
            if ("deletedAt" in args.where) {
              return query(args);
            }
            args.where = { deletedAt: null, ...args.where };
          } else {
            args.where = { deletedAt: null };
          }
          return query(args);
        },
        async upsert({ args, query }) {
          if (args.where != undefined && "deletedAt" in args.where) {
            return query(args);
          }
          args.where = { deletedAt: null, ...args.where };
          return query(args);
        },
      },
    },
  });
  return prisma;
};
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: ReturnType<typeof createPrismaClient>;
  constructor(configService: ConfigService<EnvVariables>) {
    this.client = createPrismaClient({
      DATABASE_URL: configService.getOrThrow("DATABASE_URL", { infer: true }),
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
