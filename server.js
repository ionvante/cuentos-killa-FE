const express = require('express');
const path = require('path');
const app = express();

// Puerto dinámico que inyecta Railway
const port = process.env.PORT || 8080;

// Directorio donde Angular compiló los archivos estáticos
const appDir = path.join(__dirname, 'dist', 'cuentos-killa-fe', 'browser');

// Servir archivos estáticos
app.use(express.static(appDir));

// Redirigir todas las demás rutas a index.html (esencial para Angular Routing)
app.get('*', function (req, res) {
    res.sendFile(path.join(appDir, 'index.html'));
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Frontend server is running on port ${port}`);
});
