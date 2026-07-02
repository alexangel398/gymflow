const User = require('../models/User');

const assignMember = async (req, res, next) => {
    try {
        const { id: trainerId, memberId } = req.params;
        const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
        if (!trainer) return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        const member = await User.findOne({ _id: memberId, role: 'member' });
        if (!member) return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
        const alreadyAssigned = trainer.trainerProfile.assignedMembers.map(id => id.toString()).includes(memberId);
        if (alreadyAssigned) return res.status(409).json({ success: false, message: 'El miembro ya esta asignado' });
        trainer.trainerProfile.assignedMembers.push(memberId);
        await trainer.save();
        res.json({ success: true, message: `${member.name} asignado a ${trainer.name}` });
    } catch (error) { next(error); }
};

const unassignMember = async (req, res, next) => {
    try {
        const { id: trainerId, memberId } = req.params;
        const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
        if (!trainer) return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        trainer.trainerProfile.assignedMembers = trainer.trainerProfile.assignedMembers.filter(id => id.toString() !== memberId);
        await trainer.save();
        res.json({ success: true, message: 'Asignacion removida correctamente' });
    } catch (error) { next(error); }
};

const getAssignedMembers = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' })
            .populate('trainerProfile.assignedMembers', 'name email avatar phone subscription');
        if (!trainer) return res.status(404).json({ success: false, message: 'Entrenador no encontrado' });
        res.json({ success: true, data: trainer.trainerProfile.assignedMembers });
    } catch (error) { next(error); }
};

module.exports = { assignMember, unassignMember, getAssignedMembers };
