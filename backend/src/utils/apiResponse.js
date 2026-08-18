class ApiResponse {
  static success(res, data = null, message = 'Operation successful', statusCode = 200, meta = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || (Array.isArray(message) ? message : [message]),
      timestamp: new Date().toISOString()
    });
  }

  static paginated(res, data, page, limit, total, message = 'Data fetched successfully') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
