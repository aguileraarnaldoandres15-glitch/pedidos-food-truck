// Recibe ítems ya validados con validateOrder.
export function calculateTotal(items) {
  const total = items.reduce((sum, { cantidad, precioUnitario }) => sum + cantidad * precioUnitario, 0);

  // Redondeo a 2 decimales para evitar errores de punto flotante (ej. 3 × 0.1).
  return Math.round(total * 100) / 100;
}
