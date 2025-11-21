import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from "@nestjs/common";
import * as rxjs from "rxjs";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private genTimoutError = () => {
    return new RequestTimeoutException();
  };
  createTimeoutError = () => new RequestTimeoutException();
  intercept(_context: ExecutionContext, next: CallHandler): rxjs.Observable<any> {
    return next.handle().pipe(
      rxjs.timeout(3000),
      rxjs.catchError((error) => {
        if (error instanceof rxjs.TimeoutError) {
          return rxjs.throwError(this.genTimoutError);
        }
        return rxjs.throwError(() => error as unknown);
      }),
    );
  }
}
