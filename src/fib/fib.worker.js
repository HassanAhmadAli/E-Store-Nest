const solutions = new Map();
export default function fib(n) {
    if (solutions.has(n)) {
        return solutions.get(n);
    }
    let result;
    if (n < 2) {
        result = n;
    } else {
        result = fib(n - 1) + fib(n - 2);
    }
    solutions.set(n, result);
    return result;
}