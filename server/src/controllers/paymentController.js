import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Invalid donation amount',
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      return res.status(400).json({
        message: 'Donation amount must be at least ₹10',
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
    });

    return res.status(200).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !amount
    ) {
      return res.status(400).json({
        message: 'Invalid payment data',
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      return res.status(400).json({
        message: 'Payment verification failed',
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
      });
    }

    await prisma.donation.create({
      data: {
        userId: req.user.id,
        amount: Math.round(numericAmount),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
      },
    });

    return res.status(200).json({
      message: 'Payment verified successfully',
      success: true,
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);

    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
};