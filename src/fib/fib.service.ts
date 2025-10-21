import { Injectable } from '@nestjs/common';
import { resolve } from 'node:path';
import Piscina from 'piscina';
@Injectable()
export class FibService {
	constructor() { }
	fibonacciWorkerPiscina = new Piscina({
		filename: resolve(__dirname, 'fib.worker'),
	});
	async getFib(n: number): Promise<number> {
		return await this.fibonacciWorkerPiscina.run(n) as number;
	}
}
