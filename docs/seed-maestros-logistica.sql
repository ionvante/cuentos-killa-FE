-- Semilla recomendada para checkout logístico
-- Grupo: TIPO_ENTREGA
INSERT INTO tabla_catalogo_general (grupo_codigo, codigo_maestro, valor_mostrar, descripcion, estado)
VALUES
  ('TIPO_ENTREGA', 'DOMICILIO_COURIER', 'Envío a domicilio (Courier)', 'Entrega puerta a puerta cuando hay cobertura', true),
  ('TIPO_ENTREGA', 'ENVIO_SHALOM', 'Envío por Shalom', 'Despacho por agencia cuando no hay cobertura courier', true)
ON CONFLICT DO NOTHING;

-- Grupo: COBERTURA_COURIER
-- Formato sugerido para codigo_maestro: DEPARTAMENTO|PROVINCIA|DISTRITO
-- Se aceptan comodines con * y registro TODOS
INSERT INTO tabla_catalogo_general (grupo_codigo, codigo_maestro, valor_mostrar, descripcion, estado)
VALUES
  ('COBERTURA_COURIER', 'LIMA|LIMA|MIRAFLORES', 'Cobertura Miraflores', 'Courier habilitado para el distrito', true),
  ('COBERTURA_COURIER', 'LIMA|LIMA|SAN ISIDRO', 'Cobertura San Isidro', 'Courier habilitado para el distrito', true),
  ('COBERTURA_COURIER', 'LIMA|*|*', 'Cobertura parcial Lima', 'Courier habilitado para la mayoría de zonas de Lima', true)
ON CONFLICT DO NOTHING;
