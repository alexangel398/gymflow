const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plan: {
            type: String,
            enum: ['monthly', 'quarterly', 'annual'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'past_due', 'canceled', 'trialing'],
            default: 'inactive',
        },
        amount: {
            type: Number,
            required: true, // en centavos
        },
        currency: {
            type: String,
            default: 'usd',
        },
        stripeCustomerId: { type: String, default: '' },
        stripeSubscriptionId: { type: String, default: '' },
        stripePaymentIntentId: { type: String, default: '' },
        currentPeriodStart: { type: Date, default: null },
        currentPeriodEnd: { type: Date, default: null },
        canceledAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);