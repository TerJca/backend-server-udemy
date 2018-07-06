var express = require('express');
var app = express();

app.get('/', (req, res, next ) =>
{
    res.status(200).json(
        {
            ok: true,
            mensaje: 'Petición finalizada correctamente'
        }
    );
})

module.exports = app;