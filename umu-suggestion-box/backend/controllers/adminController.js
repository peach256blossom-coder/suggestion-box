const Suggestion = require('../models/Suggestion');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getAllSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find()
      .populate('submittedBy', '-password')
      .populate('department')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    next(error);
  }
};

exports.updateSuggestionStatus = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const { status, response } = req.body;

    const suggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      {
        status,
        adminResponse: response,
        respondedAt: new Date(),
        respondedBy: req.user.userId,
      },
      { new: true }
    );

    const notification = new Notification({
      recipient: suggestion.submittedBy,
      suggestion: suggestion._id,
      type: 'status_update',
      message: `Your suggestion status: ${status}`,
    });
    await notification.save();

    res.json(suggestion);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalSuggestions = await Suggestion.countDocuments();
    const pendingSuggestions = await Suggestion.countDocuments({ status: 'pending' });
    const resolvedSuggestions = await Suggestion.countDocuments({ status: 'resolved' });
    const totalUsers = await User.countDocuments();

    res.json({
      totalSuggestions,
      pendingSuggestions,
      resolvedSuggestions,
      totalUsers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentStats = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    const stats = await Suggestion.aggregate([
      { $match: { department: departmentId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
