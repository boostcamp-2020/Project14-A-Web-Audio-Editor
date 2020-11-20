class BusinessError extends Error {
  constructor(errorCode, message) {
    super(message || errorCode.message);
    this.errorCode = errorCode;
  }
}

export { BusinessError };
