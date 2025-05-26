const Payment = require('../model/payment.model');
const Ticket = require('../model/ticket.model');

// Get all payments (admin only)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'ticket',
        populate: [
          {
            path: 'showtime',
            populate: [
              { path: 'movie', select: 'title' },
              { path: 'theater', select: 'name location' }
            ]
          },
          { path: 'customer', select: 'fullName email phone' },
          { path: 'seat', select: 'seatNumber row' }
        ]
      });

    // Calculate payment statistics
    const stats = {
      total: payments.length,
      totalAmount: 0,
      byPaymentMethod: {
        CASH: { count: 0, amount: 0 },
        CARD: { count: 0, amount: 0 },
        ONLINE: { count: 0, amount: 0 }
      },
      byStatus: {
        PENDING: { count: 0, amount: 0 },
        COMPLETED: { count: 0, amount: 0 },
        FAILED: { count: 0, amount: 0 }
      }
    };

    // Process each payment
    payments.forEach(payment => {
      const amount = payment.ticket.price;
      stats.totalAmount += amount;
      
      // Update payment method stats
      stats.byPaymentMethod[payment.paymentMethod].count++;
      stats.byPaymentMethod[payment.paymentMethod].amount += amount;
      
      // Update status stats
      stats.byStatus[payment.paymentStatus].count++;
      stats.byStatus[payment.paymentStatus].amount += amount;
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      stats,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get payments by date range (admin only)
const getPaymentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const payments = await Payment.find({
      paymentDate: {
        $gte: start,
        $lte: end
      }
    }).populate({
      path: 'ticket',
      populate: [
        {
          path: 'showtime',
          populate: [
            { path: 'movie', select: 'title' },
            { path: 'theater', select: 'name location' }
          ]
        },
        { path: 'customer', select: 'fullName email phone' },
        { path: 'seat', select: 'seatNumber row' }
      ]
    });

    // Calculate statistics for the date range
    const stats = {
      total: payments.length,
      totalAmount: 0,
      byPaymentMethod: {
        CASH: { count: 0, amount: 0 },
        CARD: { count: 0, amount: 0 },
        ONLINE: { count: 0, amount: 0 }
      },
      byStatus: {
        PENDING: { count: 0, amount: 0 },
        COMPLETED: { count: 0, amount: 0 },
        FAILED: { count: 0, amount: 0 }
      }
    };

    payments.forEach(payment => {
      const amount = payment.ticket.price;
      stats.totalAmount += amount;
      
      stats.byPaymentMethod[payment.paymentMethod].count++;
      stats.byPaymentMethod[payment.paymentMethod].amount += amount;
      
      stats.byStatus[payment.paymentStatus].count++;
      stats.byStatus[payment.paymentStatus].amount += amount;
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      dateRange: {
        start: start,
        end: end
      },
      stats,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllPayments,
  getPaymentsByDateRange
}; 