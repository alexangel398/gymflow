const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Planes disponibles con precios en centavos
const PLANS = {
    monthly: {
        name: 'Plan Mensual',
        amount: 2999, // $29.99
        interval: 'month',
        currency: 'usd',
    },
    quarterly: {
        name: 'Plan Trimestral',
        amount: 7999, // $79.99
        interval: 'quarter',
        currency: 'usd',
    },
    annual: {
        name: 'Plan Anual',
        amount: 24999, // $249.99
        interval: 'year',
        currency: 'usd',
    },
};

// @route  GET /api/payments/plans
// @access Public
const getPlans = async (req, res) => {
    res.json({
        success: true,
        data: Object.entries(PLANS).map(([key, plan]) => ({
            id: key,
            name: plan.name,
            amount: plan.amount,
            currency: plan.currency,
            interval: plan.interval,
            amountFormatted: `$${(plan.amount / 100).toFixed(2)}`,
        })),
    });
};

// @route  POST /api/payments/create-checkout
// @access Member
const createCheckout = async (req, res, next) => {
    try {
        const { planId } = req.body;

        if (!PLANS[planId]) {
            return res.status(400).json({ success: false, message: 'Plan inválido' });
        }

        const plan = PLANS[planId];
        const user = await User.findById(req.user.id);

        // Crear o recuperar customer en Stripe
        let customerId = user.subscription?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() },
            });
            customerId = customer.id;
            await User.findByIdAndUpdate(req.user.id, {
                'subscription.stripeCustomerId': customerId,
            });
        }

        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: plan.currency,
                        product_data: { name: plan.name },
                        unit_amount: plan.amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: req.user.id,
                planId,
            },
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        });

        res.json({ success: true, data: { url: session.url, sessionId: session.id } });
    } catch (error) {
        next(error);
    }
};

// @route  POST /api/payments/webhook
// @access Stripe (interno)
const webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, planId } = session.metadata;
        if (!planId) {
            console.log("Evento omitido: no tiene metadata de plan.");
            return res.json({ received: true });
        }
        const plan = PLANS[planId];
        // AGREGA ESTA VALIDACIÓN
        if (!plan) {
            console.error(`Error: No se encontró un plan con el ID: ${planId}`);
            return res.status(400).send(`Plan no encontrado: ${planId}`);
        }
        const now = new Date();
        const periodEnd = new Date(now);

        if (planId === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1);
        if (planId === 'quarterly') periodEnd.setMonth(periodEnd.getMonth() + 3);
        if (planId === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1);

        // Crear registro de suscripción
        await Subscription.create({
            member: userId,
            plan: planId,
            status: 'active',
            amount: plan.amount,
            currency: plan.currency,
            stripeCustomerId: session.customer,
            stripePaymentIntentId: session.payment_intent,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        });

        // Actualizar el usuario
        await User.findByIdAndUpdate(userId, {
            'subscription.plan': planId,
            'subscription.status': 'active',
            'subscription.stripeCustomerId': session.customer,
            'subscription.currentPeriodEnd': periodEnd,
        });

        console.log(`✅ Pago completado: ${userId} → ${planId}`);
    }

    res.json({ received: true });
};

// @route  GET /api/payments
// @access Admin
const getPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const total = await Subscription.countDocuments(filter);
        const payments = await Subscription.find(filter)
            .populate('member', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data: payments,
            pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @route  GET /api/payments/my
// @access Member
const getMyPayments = async (req, res, next) => {
    try {
        const payments = await Subscription.find({ member: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    } catch (error) {
        next(error);
    }
};

module.exports = { getPlans, createCheckout, webhook, getPayments, getMyPayments };