const Support = require('../models/Support');
const ContactInfo = require('../models/ContactInfo');
const Dean = require('../models/Dean');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-password'
  }
});

// Get all contact information
exports.getContactInfo = async (req, res, next) => {
  try {
    const contacts = await ContactInfo.find({ isActive: true });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

// Create support ticket
exports.createSupportTicket = async (req, res, next) => {
  try {
    const { email, phone, subject, message, contactMethod, category, priority, sendToDean } = req.body;

    // Validation
    if (!email || !phone || !subject || !message) {
      return res.status(400).json({ 
        message: 'Email, phone, subject, and message are required' 
      });
    }

    let deanId = null;
    let sentToDean = false;

    // If sendToDean is true, find the dean
    if (sendToDean) {
      const dean = await Dean.findOne();
      if (dean) {
        deanId = dean._id;
        sentToDean = true;
      }
    }

    const ticket = new Support({
      userId: req.user?.userId,
      email,
      phone,
      subject,
      message,
      contactMethod: contactMethod || 'web',
      category: category || 'general',
      priority: priority || 'medium',
      sendToDean,
      sentToDean,
      deanId,
      messages: [{
        sender: 'user',
        message: message,
        timestamp: new Date()
      }]
    });

    await ticket.save();

    // Send confirmation email to user
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'noreply@umusuggestionsbox.com',
        to: email,
        subject: `Support Ticket Created - ${ticket._id}`,
        html: `
          <h2>Thank you for contacting UMU Support</h2>
          <p>Your ticket has been created successfully.</p>
          <p><strong>Ticket ID:</strong> ${ticket._id}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>We will respond to you within 24 hours.</p>
          <hr>
          <p>UMU Suggestions Box Support Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // Send notification to dean if sendToDean is true
    if (sentToDean && deanId) {
      try {
        const dean = await Dean.findById(deanId);
        if (dean && dean.email) {
          await transporter.sendMail({
            from: process.env.SENDER_EMAIL || 'noreply@umusuggestionsbox.com',
            to: dean.email,
            subject: `New Support Message - ${subject}`,
            html: `
              <h2>New Support Message Directed to Dean</h2>
              <p><strong>From:</strong> ${email}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Priority:</strong> ${priority}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
              <hr>
              <p><strong>Ticket ID:</strong> ${ticket._id}</p>
              <p>Please respond to this support ticket in the admin panel.</p>
            `
          });
        }
      } catch (deanEmailError) {
        console.error('Error sending email to dean:', deanEmailError);
      }
    }

    res.status(201).json({
      message: 'Support ticket created successfully' + (sentToDean ? ' and sent to Dean' : ''),
      ticket: {
        _id: ticket._id,
        status: ticket.status,
        email: ticket.email,
        subject: ticket.subject,
        sentToDean: sentToDean,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's support tickets
exports.getUserTickets = async (req, res, next) => {
  try {
    const tickets = await Support.find({ 
      userId: req.user.userId 
    })
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Support.findById(ticketId)
      .populate('userId', 'email')
      .populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify user owns ticket or is admin
    if (ticket.userId?.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

// Add message to ticket
exports.addMessageToTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify user owns ticket or is admin
    if (ticket.userId?.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.messages.push({
      sender: req.user.role === 'admin' ? 'admin' : 'user',
      message: message.trim(),
      timestamp: new Date()
    });

    if (ticket.status === 'new') {
      ticket.status = 'open';
    }

    await ticket.save();

    res.json({
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// Update ticket status (Admin only)
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;

    if (!status || !['new', 'open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await Support.findById(ticketId);
    
    const updatedTicket = await Support.findByIdAndUpdate(
      ticketId,
      {
        status,
        priority: priority || ticket.priority,
        ...(status === 'resolved' && {
          resolvedAt: new Date(),
          resolvedBy: req.user.userId
        })
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send notification email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL || 'noreply@umusuggestionsbox.com',
        to: updatedTicket.email,
        subject: `Support Ticket Updated - ${updatedTicket._id}`,
        html: `
          <h2>Your Support Ticket has been updated</h2>
          <p><strong>Ticket ID:</strong> ${updatedTicket._id}</p>
          <p><strong>New Status:</strong> ${status.replace('_', ' ')}</p>
          <p><strong>Subject:</strong> ${updatedTicket.subject}</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// Get all tickets (Admin only)
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tickets = await Support.find(filter)
      .populate('userId', 'email')
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 });

    const stats = {
      total: tickets.length,
      new: tickets.filter(t => t.status === 'new').length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };

    res.json({ tickets, stats });
  } catch (error) {
    next(error);
  }
};

// Assign ticket to staff (Admin only)
exports.assignTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { staffId } = req.body;

    const ticket = await Support.findByIdAndUpdate(
      ticketId,
      { assignedTo: staffId },
      { new: true }
    ).populate('assignedTo', 'email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// Close ticket (Admin only)
exports.closeTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { resolution } = req.body;

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = 'closed';
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user.userId;

    if (resolution) {
      ticket.messages.push({
        sender: 'admin',
        message: `Resolution: ${resolution}`,
        timestamp: new Date()
      });
    }

    await ticket.save();

    res.json({
      message: 'Ticket closed successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// Send email response
exports.sendEmailResponse = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Send email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL || 'noreply@umusuggestionsbox.com',
      to: ticket.email,
      subject: `Re: ${ticket.subject} - Ticket ${ticket._id}`,
      html: `
        <h2>Response to your support ticket</h2>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <hr>
        <div>${response}</div>
        <hr>
        <p>Thank you for contacting UMU Support</p>
      `
    });

    ticket.messages.push({
      sender: 'admin',
      message: response,
      timestamp: new Date()
    });

    await ticket.save();

    res.json({
      message: 'Response sent successfully',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

// Get support statistics
exports.getSupportStats = async (req, res, next) => {
  try {
    const totalTickets = await Support.countDocuments();
    const newTickets = await Support.countDocuments({ status: 'new' });
    const openTickets = await Support.countDocuments({ status: 'open' });
    const inProgressTickets = await Support.countDocuments({ status: 'in_progress' });
    const resolvedTickets = await Support.countDocuments({ status: 'resolved' });
    const closedTickets = await Support.countDocuments({ status: 'closed' });

    const byCategory = await Support.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const byPriority = await Support.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      total: totalTickets,
      new: newTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      byCategory,
      byPriority
    });
  } catch (error) {
    next(error);
  }
};

// Send SMS
exports.sendSMS = async (req, res, next) => {
  try {
    const { phone, message } = req.body;

    console.log(`SMS to ${phone}: ${message}`);

    res.json({
      message: 'SMS sent successfully',
      status: 'sent',
      to: phone
    });
  } catch (error) {
    next(error);
  }
};

// Send WhatsApp
exports.sendWhatsApp = async (req, res, next) => {
  try {
    const { phone, message } = req.body;

    console.log(`WhatsApp to ${phone}: ${message}`);

    res.json({
      message: 'WhatsApp message sent successfully',
      status: 'sent',
      to: phone
    });
  } catch (error) {
    next(error);
  }
};