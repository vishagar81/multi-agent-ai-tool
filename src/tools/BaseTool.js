export class BaseTool {
    name() {
        throw new Error('Method name() must be implemented');
    }

    description() {
        throw new Error('Method description() must be implemented');
    }

    use(...args) {
        throw new Error('Method use() must be implemented');
    }
}