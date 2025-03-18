const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");
const Stripe = require("stripe");
const Notification = require("../models/notificationModel");
const Consultation = require("../models/ConsultationModel");
require("dotenv").config();

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const paymentController = {
    // Get all payments for an agent
    getPayments: asyncHandler(async (req, res) => {
        const payments = await Payment.find({ user: req.user.id })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(payments);
    }),

    // Get a single payment by ID
    getPaymentById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const payment = await Payment.findById(id);

        if (payment) {
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    // Update payment status (for admin purposes)
    updatePaymentStatus: asyncHandler(async (req, res) => {
        const { id, status } = req.body;
        const payment = await Payment.findById(id);

        if (payment) {
            payment.paymentStatus = status;
            await payment.save();
            res.json(payment);
        } else {
            res.status(404);
            throw new Error("Payment not found");
        }
    }),

    checkPaymentRequirement : asyncHandler(async (req, res, next) => {
        const user = req.user.id;
    
        // Count the number of scheduled consultations for the user
        const consultationCount = await Consultation.countDocuments({ userId: user, status: "Scheduled" });
    
        if (consultationCount >= 5) { // Adjust threshold as needed
            const activeSubscription = await Payment.findOne({
                user,
                paymentType: "subscription",
                paymentStatus: "completed",
                subscriptionExpiry: { $gte: new Date() }
            });
    
            if (!activeSubscription) {
                return res.status(403).json({ 
                    message: "Payment required to schedule more than 5 consultations." 
                });
            }
        }
        next();
    }),    

    // Process payment using Stripe
    processPayment: asyncHandler(async (req, res) => {
        const { user, amount, currency, paymentType } = req.body;

        if (!user || !amount || !paymentType) {
            return res.status(400).json({ message: "Invalid payment request." });
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: currency || "usd",
                metadata: { user },
            });

            const newPayment = new Payment({
                user,
                amount,
                paymentMethod: "credit_card",
                paymentStatus: "pending",
                transactionId: paymentIntent.id,
                paymentType,
                subscriptionExpiry: paymentType === "subscription" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
            });

            await newPayment.save();

            res.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),

    // Handle Stripe webhook events
    webhook: asyncHandler(async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY);
        } catch (err) {
            console.log(err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                const payment=await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: "completed" }
                );
                await Notification.create({
                    user: payment.user,
                    message: `🎉 Payment Successful! .`,
                });
                return res.status(200).send("💰 Payment succeeded!");

            case "checkout.session.completed":
                await Payment.findOneAndUpdate(
                    { transactionId: event.data.object.id },
                    { paymentStatus: "completed" }
                );
                return res.status(200).send("✅ Payment Completed");

            default:
                return res.status(200).send("Webhook received");
        }
    }),
};

module.exports = paymentController;
