class ApiResponse {
  constructor(statusCode, data, message = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

module.exports = ApiResponse;
