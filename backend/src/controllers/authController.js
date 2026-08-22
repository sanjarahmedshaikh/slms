const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_slms_jwt_key_2026_production_ready', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, department, phone } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return ApiResponse.error(res, 'User with this email already exists', 400);
    }

    // Security Hardening: Force self-registration role to student/faculty. Super admin & librarian are assigned by Super Admin only.
    const allowedSelfRoles = ['student', 'faculty'];
    const assignedRole = allowedSelfRoles.includes(role) ? role : 'student';

    const rolePrefix = assignedRole === 'faculty' ? 'FAC' : 'STU';
    const memberId = `${rolePrefix}-${Date.now().toString().slice(-6)}`;

    const user = await User.create({
      fullName,
      email: cleanEmail,
      password,
      role: assignedRole,
      department: department || 'Computer Science',
      phone: phone || '',
      memberId
    });

    const token = signToken(user._id);

    await AuditLog.create({
      performedBy: user._id,
      action: 'USER_REGISTER',
      module: 'AUTH',
      details: { email: user.email, role: user.role }
    });

    user.password = undefined;

    return ApiResponse.success(res, { user, token }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Please provide email and password', 400);
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'Account is deactivated. Please contact librarian.', 403);
    }

    const token = signToken(user._id);

    await AuditLog.create({
      performedBy: user._id,
      action: 'USER_LOGIN',
      module: 'AUTH',
      details: { email: user.email, role: user.role }
    });

    user.password = undefined;

    return ApiResponse.success(res, { user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return ApiResponse.success(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const genericMsg = 'If an account exists with that email address, password reset instructions have been processed.';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return ApiResponse.success(res, null, genericMsg);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      performedBy: user._id,
      action: 'FORGOT_PASSWORD_REQUEST',
      module: 'AUTH',
      details: { email: user.email }
    });

    const responsePayload = process.env.NODE_ENV === 'development' ? { resetToken } : null;

    return ApiResponse.success(res, responsePayload, genericMsg);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
    }

    if (!resetToken) {
      return ApiResponse.error(res, 'Invalid or expired password reset token.', 400);
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired password reset token.', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    await AuditLog.create({
      performedBy: user._id,
      action: 'RESET_PASSWORD_SUCCESS',
      module: 'AUTH',
      details: { email: user.email }
    });

    return ApiResponse.success(res, { user, token }, 'Password reset successfully. You are now signed in.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
