const express = require('express');
const router = express.Router();

// Esta es una ruta de prueba temporal para verificar que funcione
router.get('/test', (req, res) => {
    res.json({ message: 'La ruta de autenticación está configurada correctamente' });
});

module.exports = router;