function ErrorsHandler(err, req, res, next) {
    if (err.statusCode && err.message) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error('Error inesperado: ', err);
    return res.status(500).json({
        error: 'Error interno del servidor',
        detail: err.message
    });
}

module.exports = ErrorsHandler;