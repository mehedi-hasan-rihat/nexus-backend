class AppError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message) // Error("My Error Message")
        this.statusCode = statusCode;
    }
}

export default AppError;