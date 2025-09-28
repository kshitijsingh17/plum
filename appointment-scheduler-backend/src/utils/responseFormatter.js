exports.successResponse = (data) => ({ success: true, data });
exports.errorResponse = (message, code) => ({ success: false, error: { message, code } });
