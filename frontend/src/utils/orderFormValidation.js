// Mismas reglas que la validación del backend (backend/src/utils/orderValidation.js),
// adaptadas a los valores de un formulario: cantidad y precio pueden llegar como string desde los inputs.

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (isNonEmptyString(value)) return Number(value);
  return Number.NaN;
};

// Devuelve en `data` el pedido listo para enviar a la API (con trim y números convertidos), sin `total`.
export function validateOrderForm(values) {
  if (!isPlainObject(values)) {
    return {
      isValid: false,
      errors: { pedido: 'Los datos del pedido no son válidos' },
      data: null,
    };
  }

  const errors = {};
  const { cliente, items } = values;

  if (!isNonEmptyString(cliente)) {
    errors.cliente = 'El nombre del cliente es obligatorio';
  }

  const parsedItems = [];

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

      const cantidad = toNumber(item.cantidad);
      const precioUnitario = toNumber(item.precioUnitario);

      if (!isNonEmptyString(item.nombre)) {
        errors[`${path}.nombre`] = `El nombre del ítem ${position} es obligatorio`;
      }

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        errors[`${path}.cantidad`] = `La cantidad del ítem ${position} debe ser un número entero mayor a 0`;
      }

      if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
        errors[`${path}.precioUnitario`] = `El precio unitario del ítem ${position} debe ser un número mayor a 0`;
      }

      parsedItems.push({ nombre: isNonEmptyString(item.nombre) ? item.nombre.trim() : '', cantidad, precioUnitario });
    });
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, data: null };
  }

  return {
    isValid: true,
    errors: {},
    data: { cliente: cliente.trim(), items: parsedItems },
  };
}
