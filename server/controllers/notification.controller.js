const Notification = require('../models/Notification');

// @route  GET /api/notifications
// @access Autenticado
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unread = await Notification.countDocuments({
            user: req.user.id,
            read: false,
        });

        res.json({ success: true, data: notifications, unread });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/notifications/:id/read
// @access Autenticado
const markAsRead = async (req, res, next) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { read: true }
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @route  PUT /api/notifications/read-all
// @access Autenticado
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leidas' });
    } catch (error) {
        next(error);
    }
};

// Helper para crear notificaciones desde otros controllers
const createNotification = async ({ userId, title, message, type, link }) => {
    try {
        await Notification.create({ user: userId, title, message, type, link });
    } catch (err) {
        console.error('[NOTIFICATION ERROR]', err.message);
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };