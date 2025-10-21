import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "./common/schema/env";
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["debug", "error", "fatal", "log", "verbose", "warn"],
  });
  const config = app.get(ConfigService<EnvVariables>);
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow("PORT", { infer: true }));
}
void bootstrap();
