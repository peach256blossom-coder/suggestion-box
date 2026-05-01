const express = require('express');
const {
  getContactInfo,
  createSupportTicket,
  getUserTickets,
  getTicketById,
  addMessageToTicket,
  updateTicketStatus,
  getAllTickets,
  assignTicket,
  closeTicket,
  sendEmailResponse,
  getSupportStats,
  sendSMS,
  sendWhatsApp
} = require('../controllers/supportController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/contact-info', getContactInfo);

// User routes
router.post('/ticket', auth, createSupportTicket);
router.get('/tickets', auth, getUserTickets);
router.get('/ticket/:ticketId', auth, getTicketById);
router.post('/ticket/:ticketId/message', auth, addMessageToTicket);

// SMS & WhatsApp
router.post('/send-sms', auth, sendSMS);
router.post('/send-whatsapp', auth, sendWhatsApp);

// Admin routes
router.get('/admin/tickets', auth, adminAuth, getAllTickets);
router.put('/admin/ticket/:ticketId/status', auth, adminAuth, updateTicketStatus);
router.put('/admin/ticket/:ticketId/assign', auth, adminAuth, assignTicket);
router.put('/admin/ticket/:ticketId/close', auth, adminAuth, closeTicket);
router.post('/admin/ticket/:ticketId/email', auth, adminAuth, sendEmailResponse);
router.get('/admin/stats', auth, adminAuth, getSupportStats);

module.exports = router;