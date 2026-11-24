const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

// Valida y normaliza los datos de un pedido recibido por la API.
// Solo devuelve en `data` los campos permitidos: cualquier `total`, `estado` o `fecha` enviado se descarta.
export function validateOrder(input) {
  if (!isPlainObject(input)) {
    return {
      isValid: false,
      errors: { pedido: 'Los datos del pedido deben enviarse como un objeto' },
      data: null,
    };
  }

  const errors = {};
  const { cliente, items } = input;

  if (!isNonEmptyString(cliente)) {
    errors.cliente = 'El nombre del cliente es obligatorio';
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.items = 'El pedido debe tener al menos un ítem';
  } else {
    items.forEach((item, index) => {
      const path = `items[${index}]`;
      const position = index + 1;

      if (!isPlainObject(item)) {
        errors[path] = `El ítem ${position} no es válido`;
        return;
      }

      if (!isNonEmptyString(item.nombre)) {
        errors[`${path}.nombre`] = `El nombre del ítem ${position} es obligatorio`;
      }

      if (!isPositiveInteger(item.cantidad)) {
        errors[`${path}.cantidad`] = `La cantidad del ítem ${position} debe ser un número entero mayor a 0`;
      }

      if (!isPositiveNumber(item.precioUnitario)) {
        errors[`${path}.precioUnitario`] = `El precio unitario del ítem ${position} debe ser un número mayor a 0`;
      }
    });
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, data: null };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      cliente: cliente.trim(),
      items: items.map(({ nombre, cantidad, precioUnitario }) => ({
        nombre: nombre.trim(),
        cantidad,
        precioUnitario,
      })),
    },
  };
}
