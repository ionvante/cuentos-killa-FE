# Migración de valores libres de cuentos a códigos de maestros

Este documento define el mapeo para normalizar data histórica (valores libres) y guardar solo códigos de maestros en `categoria`, `edadRecomendada` y `tipoEdicion`.

## 1) Categoría (`CUENTO_CATEGORIA`)

| Valor libre histórico | Código destino |
|---|---|
| `Aventura` | `CAT_AVENTURA` |
| `Didáctico` | `CAT_DIDACTICO` |
| `Clásico` | `CAT_CLASICO` |
| `Fantasía` | `CAT_FANTASIA` |
| `Valores` | `CAT_VALORES` |

## 2) Edad recomendada (`RANGO_EDAD`)

| Valor libre histórico | Código destino |
|---|---|
| `0-3 años` / `0 - 3 años` | `EDAD_0_3` |
| `4-6 años` / `4 - 6 años` | `EDAD_4_6` |
| `7-9 años` / `7 - 9 años` | `EDAD_7_9` |
| `10-12 años` | `EDAD_10_12` |
| `13+ años` | `EDAD_13_MAS` |

## 3) Tipo de edición (`TIPO_EDICION`)

| Valor libre histórico | Código destino |
|---|---|
| `Tapa dura` | `EDICION_TAPA_DURA` |
| `Tapa blanda` | `EDICION_TAPA_BLANDA` |
| `Ilustrado` | `EDICION_ILUSTRADO` |
| `Bilingüe` | `EDICION_BILINGUE` |
| `Colección` | `EDICION_COLECCION` |

## Reglas de migración

1. Si el valor ya es un código existente en maestros, conservarlo.
2. Si el valor coincide por etiqueta (`valor`) en maestros, reemplazar por su `codigo`.
3. Si no coincide, aplicar el diccionario histórico definido arriba.
4. Si no existe coincidencia, dejar vacío y revisar manualmente.

## Referencia de implementación FE

La normalización en Frontend está implementada en:
- `src/app/shared/cuento-maestros.ts`
