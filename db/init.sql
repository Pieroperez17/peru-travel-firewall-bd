-- Peru Travel: esquema y datos FICTICIOS para el laboratorio.
-- Se ejecuta solo la primera vez que se crea la base de datos (o tras "docker compose down -v").
-- Ningun dato corresponde a personas reales.

SET NAMES utf8mb4;
USE perutravel;

CREATE TABLE tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  region VARCHAR(40) NOT NULL,
  dias INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descripcion TEXT
) CHARACTER SET utf8mb4;

CREATE TABLE resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  autor VARCHAR(60) NOT NULL,
  comentario TEXT NOT NULL,
  puntaje TINYINT NOT NULL DEFAULT 5,
  fecha DATETIME NOT NULL
) CHARACTER SET utf8mb4;

-- Tabla SENSIBLE: datos personales de clientes (casos 4 y 5)
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  dni CHAR(8) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  tarjeta_ultimos4 CHAR(4) NOT NULL
) CHARACTER SET utf8mb4;

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tour_id INT NOT NULL,
  fecha_viaje DATE NOT NULL,
  personas INT NOT NULL,
  total DECIMAL(10,2) NOT NULL
) CHARACTER SET utf8mb4;

-- Tabla SENSIBLE: cuentas del personal (contrasenas en SHA-256)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(40) NOT NULL UNIQUE,
  password CHAR(64) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL
) CHARACTER SET utf8mb4;

INSERT INTO tours (nombre, destino, region, dias, precio, descripcion) VALUES
('Machu Picchu Clásico', 'Machu Picchu, Cusco', 'Cusco', 2, 1450.00, 'Tren a Aguas Calientes, visita guiada a la ciudadela inca y regreso a Cusco.'),
('Valle Sagrado de los Incas', 'Pisac y Ollantaytambo, Cusco', 'Cusco', 1, 220.00, 'Mercado de Pisac, almuerzo buffet en Urubamba y fortaleza de Ollantaytambo.'),
('Montaña de Siete Colores', 'Vinicunca, Cusco', 'Cusco', 1, 180.00, 'Caminata a 5 000 m s. n. m. con desayuno y almuerzo incluidos.'),
('Lago Titicaca y los Uros', 'Puno', 'Puno', 2, 390.00, 'Islas flotantes de los Uros, isla Taquile y noche en casa vivencial.'),
('Cañón del Colca', 'Chivay, Arequipa', 'Arequipa', 2, 340.00, 'Mirador Cruz del Cóndor, baños termales y pueblos tradicionales del valle.'),
('Líneas de Nazca', 'Nazca, Ica', 'Ica', 1, 520.00, 'Sobrevuelo de 35 minutos sobre las figuras y visita al cementerio de Chauchilla.'),
('Paracas e Islas Ballestas', 'Paracas, Ica', 'Ica', 1, 260.00, 'Paseo en lancha a las islas, lobos marinos y reserva nacional de Paracas.'),
('Oasis de Huacachina', 'Ica', 'Ica', 1, 150.00, 'Tubulares y sandboard en las dunas al atardecer.'),
('Fortaleza de Kuélap', 'Chachapoyas, Amazonas', 'Amazonas', 3, 890.00, 'Teleférico a Kuélap, catarata de Gocta y sarcófagos de Karajía.'),
('Reserva Tambopata', 'Puerto Maldonado, Madre de Dios', 'Madre de Dios', 3, 1100.00, 'Lodge en la selva, collpa de guacamayos y lago Sandoval.');

INSERT INTO resenas (tour_id, autor, comentario, puntaje, fecha) VALUES
(1, 'Lucía', 'El guía explicó todo con mucho detalle. Vale cada sol.', 5, '2026-09-14 10:20:00'),
(1, 'Marco', 'Mucha gente en la ciudadela; recomiendo el primer turno.', 4, '2026-10-02 18:05:00'),
(3, 'Andrea', 'Dura la subida, pero el paisaje es increíble.', 5, '2026-08-21 09:40:00'),
(4, 'Jorge', 'La noche en Taquile fue lo mejor del viaje.', 5, '2026-10-11 21:15:00'),
(6, 'Valeria', 'El sobrevuelo es corto pero impresionante.', 4, '2026-09-30 16:00:00');

INSERT INTO clientes (nombres, dni, correo, telefono, tarjeta_ultimos4) VALUES
('Ana Quispe Rojas', '40000001', 'ana.quispe@example.com', '900000001', '4821'),
('Carlos Mendoza Vega', '40000002', 'carlos.mendoza@example.com', '900000002', '1937'),
('Rosa Huamán Torres', '40000003', 'rosa.huaman@example.com', '900000003', '5502'),
('Diego Salazar Ramos', '40000004', 'diego.salazar@example.com', '900000004', '7718'),
('Patricia Flores Lima', '40000005', 'patricia.flores@example.com', '900000005', '3046'),
('Luis Condori Mamani', '40000006', 'luis.condori@example.com', '900000006', '8890');

INSERT INTO reservas (cliente_id, tour_id, fecha_viaje, personas, total) VALUES
(1, 1, '2026-12-05', 2, 2900.00),
(2, 4, '2026-12-12', 1, 390.00),
(3, 6, '2026-12-18', 3, 1560.00),
(4, 2, '2027-01-08', 4, 880.00),
(5, 10, '2027-01-20', 2, 2200.00),
(6, 5, '2027-02-02', 2, 680.00);

INSERT INTO usuarios (usuario, password, nombre, rol) VALUES
('admin', SHA2('PeruTravel2026', 256), 'Administrador del sistema', 'admin'),
('vendedor', SHA2('Ventas2026', 256), 'Equipo de ventas', 'ventas');

-- Usuario de consulta (caso 4): puede leer la base de datos,
-- pero el firewall le bloquea las tablas sensibles (clientes y usuarios).
CREATE USER IF NOT EXISTS 'analista'@'%' IDENTIFIED BY 'Analista2026';
GRANT SELECT ON perutravel.* TO 'analista'@'%';
FLUSH PRIVILEGES;
