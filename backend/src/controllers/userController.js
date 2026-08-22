const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');
const escapeRegExp = require('../utils/escapeRegExp');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const rawSearch = typeof req.query.search === 'string' ? req.query.search : '';
    const role = typeof req.query.role === 'string' ? req.query.role : '';

    const query = {};
    if (rawSearch.trim()) {
      const escaped = escapeRegExp(rawSearch.trim());
      query.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { memberId: { $regex: escaped, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return ApiResponse.paginated(res, users, page, limit, total, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    await AuditLog.create({
      performedBy: req.user.id,
      action: 'UPDATE_USER_ROLE',
      module: 'USERS',
      details: { targetUserId: user._id, newRole: role, isActive }
    });

    return ApiResponse.success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole };
