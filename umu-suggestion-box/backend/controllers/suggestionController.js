const Suggestion = require('../models/Suggestion');
const Notification = require('../models/Notification');
const Department = require('../models/Department');

// Submit a new suggestion
exports.submitSuggestion = async (req, res, next) => {
  try {
    const { title, description, category, department, isPrivate } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({ message: 'Title must be at least 5 characters' });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({ message: 'Title cannot exceed 100 characters' });
    }

    if (description.trim().length < 20) {
      return res.status(400).json({ message: 'Description must be at least 20 characters' });
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({ message: 'Description cannot exceed 2000 characters' });
    }

    let departmentId = null;
    if (isPrivate && department) {
      const deptData = await Department.findOne({
        name: { $regex: `^${department}$`, $options: 'i' }
      });

      if (!deptData) {
        return res.status(400).json({
          message: `Department '${department}' not found. Choose from: BAM, SASS, SCIENCE, AGRIC, FOBE, EDUC, LAW`
        });
      }
      departmentId = deptData._id;
    }

    const suggestion = new Suggestion({
      title: title.trim(),
      description: description.trim(),
      category,
      department: departmentId,
      submittedBy: req.user.userId,
      isPrivate,
      isPublic: !isPrivate,
    });

    await suggestion.save();

    // Create notification for department if private
    if (isPrivate && departmentId) {
      try {
        const notification = new Notification({
          recipient: departmentId,
          suggestion: suggestion._id,
          type: 'new_suggestion',
          message: `New suggestion received: "${title}"`
        });
        await notification.save();
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    res.status(201).json({
      message: 'Suggestion submitted successfully!',
      suggestion: {
        _id: suggestion._id,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        isPrivate: suggestion.isPrivate,
        isPublic: suggestion.isPublic,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
      }
    });
  } catch (error) {
    console.error('Error submitting suggestion:', error);
    next(error);
  }
};

// Get all public suggestions
exports.getPublicSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find({
      isPublic: true,
      status: { $ne: 'rejected' }
    })
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .sort({ createdAt: -1 })
      .lean();

    // Sanitize data - remove user details
    const sanitized = suggestions.map(sugg => ({
      ...sugg,
      submittedBy: {
        _id: sugg.submittedBy?._id,
      },
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Error getting public suggestions:', error);
    next(error);
  }
};

// Get user's own suggestions
exports.getUserSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find({
      submittedBy: req.user.userId
    })
      .populate('department', 'name')
      .populate('respondedBy', 'email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting user suggestions:', error);
    next(error);
  }
};

// Get department suggestions (private suggestions for that department)
exports.getDepartmentSuggestions = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    // Validate ObjectId
    if (!departmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }

    const suggestions = await Suggestion.find({
      department: departmentId,
      isPrivate: true,
    })
      .populate('submittedBy', '-password -email')
      .populate('department', 'name')
      .populate('respondedBy', 'email')
      .sort({ createdAt: -1 })
      .lean();

    // Sanitize data
    const sanitized = suggestions.map(sugg => ({
      ...sugg,
      submittedBy: {
        _id: sugg.submittedBy?._id,
      },
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Error getting department suggestions:', error);
    next(error);
  }
};

// Respond to a suggestion (Department Head or Admin)
exports.respondToSuggestion = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const { response, status } = req.body;

    // Validation
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response is required' });
    }

    if (!status || !['pending', 'under_review', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestion = await Suggestion.findById(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Check authorization - only department head or admin can respond
    if (req.user.role !== 'admin' && req.user.role !== 'department_head') {
      return res.status(403).json({ message: 'Only department heads and admins can respond' });
    }

    // If department head, verify they belong to the suggestion's department
    if (req.user.role === 'department_head' && suggestion.department.toString() !== req.user.departmentId) {
      return res.status(403).json({ message: 'You can only respond to suggestions for your department' });
    }

    suggestion.adminResponse = response.trim();
    suggestion.status = status;
    suggestion.respondedAt = new Date();
    suggestion.respondedBy = req.user.userId;

    await suggestion.save();

    // Create notification for user
    try {
      const notification = new Notification({
        recipient: suggestion.submittedBy,
        suggestion: suggestion._id,
        type: 'response',
        message: `Your suggestion has been reviewed and marked as ${status.replace('_', ' ')}`
      });
      await notification.save();
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      message: 'Response sent successfully',
      suggestion
    });
  } catch (error) {
    console.error('Error responding to suggestion:', error);
    next(error);
  }
};

// Get notifications for user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId
    })
      .populate({
        path: 'suggestion',
        select: 'title description category status'
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    next(error);
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

// Upvote a suggestion
exports.upvoteSuggestion = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json({
      message: 'Suggestion upvoted',
      suggestion
    });
  } catch (error) {
    console.error('Error upvoting suggestion:', error);
    next(error);
  }
};

// Get suggestion by ID (for detailed view)
exports.getSuggestionById = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await Suggestion.findById(suggestionId)
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .populate('department', 'name');

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Check if user can view this suggestion
    if (suggestion.isPrivate) {
      // Private - only department and admin can view
      if (
        req.user.role !== 'admin' &&
        (req.user.role !== 'department_head' || suggestion.department._id.toString() !== req.user.departmentId)
      ) {
        return res.status(403).json({ message: 'You cannot view this suggestion' });
      }
    }

    // Increment view count
    suggestion.views = (suggestion.views || 0) + 1;
    await suggestion.save();

    // Sanitize submitter data
    const sanitized = {
      ...suggestion.toObject(),
      submittedBy: {
        _id: suggestion.submittedBy?._id,
      }
    };

    res.json(sanitized);
  } catch (error) {
    console.error('Error getting suggestion:', error);
    next(error);
  }
};

// Get suggestions by category
exports.getSuggestionsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const suggestions = await Suggestion.find({
      category: category,
      isPublic: true,
      status: { $ne: 'rejected' }
    })
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .sort({ upvotes: -1, createdAt: -1 })
      .lean();

    const sanitized = suggestions.map(sugg => ({
      ...sugg,
      submittedBy: {
        _id: sugg.submittedBy?._id,
      },
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Error getting suggestions by category:', error);
    next(error);
  }
};

// Get suggestions by status (Admin only)
exports.getSuggestionsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!['pending', 'under_review', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestions = await Suggestion.find({ status })
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions by status:', error);
    next(error);
  }
};

// Get all suggestions (Admin only)
exports.getAllSuggestions = async (req, res, next) => {
  try {
    const { status, category, isPrivate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (isPrivate !== undefined) filter.isPrivate = isPrivate === 'true';

    const suggestions = await Suggestion.find(filter)
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting all suggestions:', error);
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalSuggestions = await Suggestion.countDocuments();
    const pendingSuggestions = await Suggestion.countDocuments({ status: 'pending' });
    const underReviewSuggestions = await Suggestion.countDocuments({ status: 'under_review' });
    const resolvedSuggestions = await Suggestion.countDocuments({ status: 'resolved' });
    const rejectedSuggestions = await Suggestion.countDocuments({ status: 'rejected' });
    const publicSuggestions = await Suggestion.countDocuments({ isPublic: true });
    const privateSuggestions = await Suggestion.countDocuments({ isPrivate: true });

    // Stats by category
    const byCategory = await Suggestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Stats by status
    const byStatus = await Suggestion.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent suggestions
    const recentSuggestions = await Suggestion.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category status createdAt');

    res.json({
      total: totalSuggestions,
      pending: pendingSuggestions,
      underReview: underReviewSuggestions,
      resolved: resolvedSuggestions,
      rejected: rejectedSuggestions,
      public: publicSuggestions,
      private: privateSuggestions,
      byCategory,
      byStatus,
      recentSuggestions
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    next(error);
  }
};

// Delete a suggestion (Admin only or suggestion owner)
exports.deleteSuggestion = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await Suggestion.findById(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Check authorization - only admin or owner can delete
    if (req.user.role !== 'admin' && suggestion.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this suggestion' });
    }

    await Suggestion.findByIdAndDelete(suggestionId);

    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    next(error);
  }
};

// Get trending suggestions (Most upvoted)
exports.getTrendingSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find({
      isPublic: true,
      status: { $ne: 'rejected' }
    })
      .populate('submittedBy', '-password -email')
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(10)
      .lean();

    const sanitized = suggestions.map(sugg => ({
      ...sugg,
      submittedBy: {
        _id: sugg.submittedBy?._id,
      },
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Error getting trending suggestions:', error);
    next(error);
  }
};

// Get suggestions count for dashboard
exports.getSuggestionsCount = async (req, res, next) => {
  try {
    const userSuggestions = await Suggestion.countDocuments({
      submittedBy: req.user.userId
    });

    const pendingUserSuggestions = await Suggestion.countDocuments({
      submittedBy: req.user.userId,
      status: 'pending'
    });

    const resolvedUserSuggestions = await Suggestion.countDocuments({
      submittedBy: req.user.userId,
      status: 'resolved'
    });

    res.json({
      total: userSuggestions,
      pending: pendingUserSuggestions,
      resolved: resolvedUserSuggestions
    });
  } catch (error) {
    console.error('Error getting suggestions count:', error);
    next(error);
  }
};

// Dean functions
exports.getAllSuggestionsForDean = async (req, res, next) => {
  try {
    const suggestions = await Suggestion.find({})
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    const stats = {
      total: suggestions.length,
      pending: suggestions.filter(s => s.status === 'pending').length,
      underReview: suggestions.filter(s => s.status === 'under_review').length,
      resolved: suggestions.filter(s => s.status === 'resolved').length,
      rejected: suggestions.filter(s => s.status === 'rejected').length,
      public: suggestions.filter(s => !s.isPrivate).length,
      private: suggestions.filter(s => s.isPrivate).length,
    };

    res.json({ suggestions, stats });
  } catch (error) {
    console.error('Error getting all suggestions for dean:', error);
    next(error);
  }
};

exports.getSuggestionsByStatusForDean = async (req, res, next) => {
  try {
    const { status } = req.params;

    if (!['pending', 'under_review', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestions = await Suggestion.find({ status })
      .populate('submittedBy', '-password -email')
      .populate('respondedBy', 'email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions by status for dean:', error);
    next(error);
  }
};

exports.respondToSuggestionAsDean = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const { response, status } = req.body;

    // Validation
    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response is required' });
    }

    if (!status || !['pending', 'under_review', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestion = await Suggestion.findById(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    suggestion.adminResponse = response.trim();
    suggestion.status = status;
    suggestion.respondedAt = new Date();
    suggestion.respondedBy = req.dean?.deanId || req.user?.userId;

    await suggestion.save();

    // Create notification for user
    try {
      const notification = new Notification({
        recipient: suggestion.submittedBy,
        suggestion: suggestion._id,
        type: 'response',
        message: `Your suggestion has been reviewed and marked as ${status.replace('_', ' ')}`
      });
      await notification.save();
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.json({
      message: 'Response sent successfully',
      suggestion
    });
  } catch (error) {
    console.error('Error responding to suggestion as dean:', error);
    next(error);
  }
};

// Delete a suggestion by dean and notify the submitter
exports.deleteSuggestionByDean = async (req, res, next) => {
  try {
    const { suggestionId } = req.params;
    const { reason } = req.body;

    const suggestion = await Suggestion.findById(suggestionId);

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Store submitter info before deleting
    const submitterId = suggestion.submittedBy;
    const suggestionTitle = suggestion.title;

    // Delete the suggestion
    await Suggestion.findByIdAndDelete(suggestionId);

    // Create a deletion notification for the submitter
    try {
      const deleteMessage = reason 
        ? `Your suggestion "${suggestionTitle}" has been resolved and removed to clear the queue. Reason: ${reason}`
        : `Your suggestion "${suggestionTitle}" has been resolved and removed to avoid duplicate submissions in the future.`;

      const notification = new Notification({
        recipient: submitterId,
        suggestion: suggestionId,
        type: 'suggestion_deleted',
        message: deleteMessage
      });
      await notification.save();
    } catch (notifError) {
      console.error('Error creating deletion notification:', notifError);
    }

    res.json({
      message: 'Suggestion deleted successfully and notification sent to submitter',
      deletedSuggestionId: suggestionId
    });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    next(error);
  }
};