export const ORDER_STATUSES = Object.freeze(['recibido', 'en preparación', 'listo', 'entregado']);

const FINAL_STATUS = ORDER_STATUSES[ORDER_STATUSES.length - 1];

export function getNextStatus(currentStatus) {
  const index = ORDER_STATUSES.indexOf(currentStatus);

  if (index === -1 || currentStatus === FINAL_STATUS) {
    return null;
  }

  return ORDER_STATUSES[index + 1];
}

export function validateTransition(currentStatus, targetStatus) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);

  if (currentIndex === -1) {
    return { ok: false, reason: `El estado actual "${currentStatus}" no es válido` };
  }

  if (currentStatus === FINAL_STATUS) {
    return { ok: false, reason: 'El pedido ya fue entregado y no se puede modificar' };
  }

  const targetIndex = ORDER_STATUSES.indexOf(targetStatus);

  if (targetIndex === -1) {
    return {
      ok: false,
      reason: `El estado "${targetStatus}" no es válido. Estados permitidos: ${ORDER_STATUSES.join(', ')}`,
    };
  }

  if (targetIndex === currentIndex) {
    return { ok: false, reason: `El pedido ya está en estado "${currentStatus}"` };
  }

  if (targetIndex < currentIndex) {
    return {
      ok: false,
      reason: `No se puede retroceder el pedido de "${currentStatus}" a "${targetStatus}"`,
    };
  }

  if (targetIndex > currentIndex + 1) {
    return {
      ok: false,
      reason: `No se puede saltear estados: desde "${currentStatus}" solo se puede pasar a "${getNextStatus(currentStatus)}"`,
    };
  }

  return { ok: true };
}
