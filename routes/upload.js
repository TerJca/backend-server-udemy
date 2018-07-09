var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next ) =>
{
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios']

    if(tiposValidos.indexOf(tipo) < 0)
    {
        return res.status(500).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida', 
            errors: {message: 'Las colecciones válidas son: ' + tiposValidos.join(', ')}
        });
    }

    if(!req.files)
    {
        return res.status(500).json({
            ok: false,
            mensaje: 'No se ha seleccionado ningún archivo', 
            errors: {message: 'Debe de seleccionar una imagen'}
        });
    }

    // Obtener nombre archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Solo estas extensiones son aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0)
    {
        return res.status(500).json({
            ok: false,
            mensaje: 'Extensión no válida', 
            errors: {message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ')}
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archvo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => 
    {
        if (err)
        {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo', 
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    })

})

function subirPorTipo(tipo, id, nombreArchivo, res)
{
    if (tipo === 'usuarios')
    {
        Usuario.findById(id, (err, usuario) => 
        {
            if (err)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar el usuario', 
                    errors: err
                });
            }

            if (!usuario)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe', 
                    errors: {message: 'Usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            if(fs.existsSync(pathViejo))
            {
                fs.unlink(pathViejo, (err) => 
                {
                    if (err) 
                    {
                        throw err;
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) =>
            {
                usuarioActualizado.password = ":)";

                if (err)
                {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el archivo', 
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario:usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos')
    {
        Medico.findById(id, (err, medico) => 
        {
            if (err)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar el medico', 
                    errors: err
                });
            }

            if (!medico)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe', 
                    errors: {message: 'Medico no existe'}
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            if(fs.existsSync(pathViejo))
            {
                fs.unlink(pathViejo, (err) => 
                {
                    if (err) 
                    {
                        throw err;
                    }
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) =>
            {
                if (err)
                {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el archivo', 
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico:medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales')
    {
        Hospital.findById(id, (err, hospital) => 
        {
            if (!hospital)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe', 
                    errors: {message: 'Hospital no existe'}
                });
            }
            
            if (err)
            {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al encontrar el hospital', 
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            if(fs.existsSync(pathViejo))
            {
                fs.unlink(pathViejo, (err) => 
                {
                    if (err) 
                    {
                        throw err;
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) =>
            {
                if (err)
                {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar el archivo', 
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;