export interface Distrito {
    nombre: string;
}

export interface Provincia {
    nombre: string;
    distritos: Distrito[];
}

export interface Departamento {
    nombre: string;
    provincias: Provincia[];
}

// Ubigeo simplificado para el checkout
export const UBIGEO_PERU: Departamento[] = [
    {
        nombre: 'Lima',
        provincias: [
            {
                nombre: 'Lima',
                distritos: [
                    { nombre: 'Ancón' }, { nombre: 'Ate' }, { nombre: 'Barranco' }, { nombre: 'Breña' },
                    { nombre: 'Carabayllo' }, { nombre: 'Chaclacayo' }, { nombre: 'Chorrillos' }, { nombre: 'Cieneguilla' },
                    { nombre: 'Comas' }, { nombre: 'El Agustino' }, { nombre: 'Independencia' }, { nombre: 'Jesús María' },
                    { nombre: 'La Molina' }, { nombre: 'La Victoria' }, { nombre: 'Lince' }, { nombre: 'Los Olivos' },
                    { nombre: 'Lurigancho' }, { nombre: 'Lurín' }, { nombre: 'Magdalena del Mar' }, { nombre: 'Pueblo Libre' },
                    { nombre: 'Miraflores' }, { nombre: 'Pachacámac' }, { nombre: 'Pucusana' }, { nombre: 'Puente Piedra' },
                    { nombre: 'Punta Hermosa' }, { nombre: 'Punta Negra' }, { nombre: 'Rímac' }, { nombre: 'San Bartolo' },
                    { nombre: 'San Borja' }, { nombre: 'San Isidro' }, { nombre: 'San Juan de Lurigancho' },
                    { nombre: 'San Juan de Miraflores' }, { nombre: 'San Luis' }, { nombre: 'San Martín de Porres' },
                    { nombre: 'San Miguel' }, { nombre: 'Santa Anita' }, { nombre: 'Santa María del Mar' }, { nombre: 'Santa Rosa' },
                    { nombre: 'Santiago de Surco' }, { nombre: 'Surquillo' }, { nombre: 'Villa El Salvador' }, { nombre: 'Villa María del Triunfo' }
                ]
            },
            {
                nombre: 'Callao',
                distritos: [
                    { nombre: 'Bellavista' }, { nombre: 'Callao' }, { nombre: 'Carmen de la Legua-Reynoso' },
                    { nombre: 'La Perla' }, { nombre: 'La Punta' }, { nombre: 'Mi Perú' }, { nombre: 'Ventanilla' }
                ]
            },
            {
                nombre: 'Cañete',
                distritos: [
                    { nombre: 'Asia' }, { nombre: 'Calango' }, { nombre: 'Cerro Azul' }, { nombre: 'Chilca' },
                    { nombre: 'Coayllo' }, { nombre: 'Imperial' }, { nombre: 'Lunahuaná' }, { nombre: 'Mala' },
                    { nombre: 'Nuevo Imperial' }, { nombre: 'Pacarán' }, { nombre: 'Quilmaná' }, { nombre: 'San Antonio' },
                    { nombre: 'San Luis' }, { nombre: 'San Vicente de Cañete' }, { nombre: 'Santa Cruz de Flores' }, { nombre: 'Zúñiga' }
                ]
            }
        ]
    },
    {
        nombre: 'Arequipa',
        provincias: [
            {
                nombre: 'Arequipa',
                distritos: [
                    { nombre: 'Alto Selva Alegre' }, { nombre: 'Arequipa' }, { nombre: 'Cayma' }, { nombre: 'Cerro Colorado' },
                    { nombre: 'Characato' }, { nombre: 'Chiguata' }, { nombre: 'Jacobo Hunter' }, { nombre: 'Jose Luis Bustamante y Rivero' },
                    { nombre: 'La Joya' }, { nombre: 'Mariano Melgar' }, { nombre: 'Miraflores' }, { nombre: 'Mollebaya' },
                    { nombre: 'Paucarpata' }, { nombre: 'Pocsi' }, { nombre: 'Polobaya' }, { nombre: 'Quequeña' },
                    { nombre: 'Sabandía' }, { nombre: 'Sachaca' }, { nombre: 'San Juan de Siguas' }, { nombre: 'San Juan de Tarucani' },
                    { nombre: 'Santa Isabel de Siguas' }, { nombre: 'Santa Rita de Siguas' }, { nombre: 'Socabaya' }, { nombre: 'Tiabaya' },
                    { nombre: 'Uchumayo' }, { nombre: 'Vitor' }, { nombre: 'Yanahuara' }, { nombre: 'Yarabamba' }, { nombre: 'Yura' }
                ]
            }
        ]
    },
    {
        nombre: 'Cusco',
        provincias: [
            {
                nombre: 'Cusco',
                distritos: [
                    { nombre: 'Ccorca' }, { nombre: 'Cusco' }, { nombre: 'Poroy' }, { nombre: 'San Jerónimo' },
                    { nombre: 'San Sebastián' }, { nombre: 'Santiago' }, { nombre: 'Saylla' }, { nombre: 'Wanchaq' }
                ]
            },
            {
                nombre: 'Urubamba',
                distritos: [
                    { nombre: 'Chinchero' }, { nombre: 'Huayllabamba' }, { nombre: 'Machupicchu' }, { nombre: 'Maras' },
                    { nombre: 'Ollantaytambo' }, { nombre: 'Urubamba' }, { nombre: 'Yucay' }
                ]
            }
        ]
    },
    {
        nombre: 'La Libertad',
        provincias: [
            {
                nombre: 'Trujillo',
                distritos: [
                    { nombre: 'El Porvenir' }, { nombre: 'Florencia de Mora' }, { nombre: 'Huanchaco' }, { nombre: 'La Esperanza' },
                    { nombre: 'Laredo' }, { nombre: 'Moche' }, { nombre: 'Poroto' }, { nombre: 'Salaverry' },
                    { nombre: 'Simbal' }, { nombre: 'Trujillo' }, { nombre: 'Victor Larco Herrera' }
                ]
            }
        ]
    },
    {
        nombre: 'Piura',
        provincias: [
            {
                nombre: 'Piura',
                distritos: [
                    { nombre: 'Castilla' }, { nombre: 'Catacaos' }, { nombre: 'Cura Mori' }, { nombre: 'El Tallán' },
                    { nombre: 'La Arena' }, { nombre: 'La Unión' }, { nombre: 'Las Lomas' }, { nombre: 'Piura' },
                    { nombre: 'Tambogrande' }, { nombre: 'Veintiseis de Octubre' }
                ]
            }
        ]
    },
    {
        nombre: 'Junín',
        provincias: [
            {
                nombre: 'Huancayo',
                distritos: [
                    { nombre: 'Carhuacallanca' }, { nombre: 'Chacapampa' }, { nombre: 'Chicche' }, { nombre: 'Chilca' },
                    { nombre: 'Chongos Alto' }, { nombre: 'Chupuro' }, { nombre: 'Colca' }, { nombre: 'Cullhuas' },
                    { nombre: 'El Tambo' }, { nombre: 'Huacrapuquio' }, { nombre: 'Hualhuas' }, { nombre: 'Huancan' },
                    { nombre: 'Huancayo' }, { nombre: 'Huantan' }, { nombre: 'Huasi' }, { nombre: 'Huayucachi' },
                    { nombre: 'Ingenio' }, { nombre: 'Pariahuanca' }, { nombre: 'Pilcomayo' }, { nombre: 'Pucara' },
                    { nombre: 'Quichuay' }, { nombre: 'Quilcas' }, { nombre: 'San Agustín' }, { nombre: 'San Jerónimo de Tunan' },
                    { nombre: 'Saño' }, { nombre: 'Sapallanga' }, { nombre: 'Sicaya' }, { nombre: 'Santo Domingo de Acobamba' },
                    { nombre: 'Viques' }
                ]
            }
        ]
    },
    {
        nombre: 'Lambayeque',
        provincias: [
            {
                nombre: 'Chiclayo',
                distritos: [
                    { nombre: 'Cayaltí' }, { nombre: 'Chiclayo' }, { nombre: 'Chongoyape' }, { nombre: 'Eten' },
                    { nombre: 'Eten Puerto' }, { nombre: 'José Leonardo Ortiz' }, { nombre: 'La Victoria' }, { nombre: 'Lagunas' },
                    { nombre: 'Monsefu' }, { nombre: 'Nueva Arica' }, { nombre: 'Oyotún' }, { nombre: 'Picsi' },
                    { nombre: 'Pimentel' }, { nombre: 'Reque' }, { nombre: 'Santa Rosa' }, { nombre: 'Saña' },
                    { nombre: 'Tumán' }, { nombre: 'Pomalca' }, { nombre: 'Pucalá' }, { nombre: 'Pátapo' }
                ]
            }
        ]
    }
];
