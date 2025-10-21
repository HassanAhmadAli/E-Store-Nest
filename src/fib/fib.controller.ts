import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { FibService } from './fib.service';
import { Public } from '@/common/decorators/public.decorator';

@Public()
@Controller('fib')
export class FibController {
    constructor(private readonly fibSerbice: FibService) { }
    @Get()
    async getFib(@Query("n", ParseIntPipe) n: number) {
        return await this.fibSerbice.getFib(n);
    }
}
