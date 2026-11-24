import { describe, it, expect } from 'vitest';
import { ORDER_STATUSES, getNextStatus, validateTransition } from './orderStatus.js';

describe('ORDER_STATUSES', () => {
  it('define los estados en el orden estricto del flujo', () => {
    expect(ORDER_STATUSES).toEqual(['recibido', 'en preparación', 'listo', 'entregado']);
  });
});

describe('getNextStatus', () => {
  describe('FOOD-03 CA1: estado inmediatamente siguiente', () => {
    it.each([
      ['recibido', 'en preparación'],
      ['en preparación', 'listo'],
      ['listo', 'entregado'],
    ])('desde "%s" el siguiente estado es "%s"', (current, next) => {
      expect(getNextStatus(current)).toBe(next);
    });

    it('devuelve null para un pedido entregado', () => {
      expect(getNextStatus('entregado')).toBeNull();
    });

    it.each([['cancelado'], [''], [undefined], [null]])('devuelve null para un estado desconocido (%s)', (status) => {
      expect(getNextStatus(status)).toBeNull();
    });
  });
});

describe('validateTransition', () => {
  describe('FOOD-03 CA1: transiciones válidas', () => {
    it.each([
      ['recibido', 'en preparación'],
      ['en preparación', 'listo'],
      ['listo', 'entregado'],
    ])('permite pasar de "%s" a "%s"', (current, target) => {
      expect(validateTransition(current, target)).toEqual({ ok: true });
    });
  });

  describe('FOOD-03 CA2: no se puede saltear estados', () => {
    it.each([
      ['recibido', 'listo'],
      ['recibido', 'entregado'],
      ['en preparación', 'entregado'],
    ])('rechaza pasar de "%s" a "%s"', (current, target) => {
      const result = validateTransition(current, target);

      expect(result.ok).toBe(false);
      expect(result.reason).toMatch(/saltear/i);
    });
  });

  describe('FOOD-03 CA2: no se puede retroceder', () => {
    it.each([
      ['listo', 'recibido'],
      ['en preparación', 'recibido'],
      ['listo', 'en preparación'],
    ])('rechaza volver de "%s" a "%s"', (current, target) => {
      const result = validateTransition(current, target);

      expect(result.ok).toBe(false);
      expect(result.reason).toMatch(/retroceder/i);
    });
  });

  describe('FOOD-03 CA2: mismo estado o destino inválido', () => {
    it('rechaza pasar al mismo estado', () => {
      const result = validateTransition('recibido', 'recibido');

      expect(result.ok).toBe(false);
      expect(result.reason).toEqual(expect.any(String));
    });

    it.each([['cancelado'], [''], [undefined], [null]])('rechaza un estado destino inválido (%s)', (target) => {
      const result = validateTransition('recibido', target);

      expect(result.ok).toBe(false);
      expect(result.reason).toMatch(/no es válido/i);
    });

    it('rechaza cuando el estado actual es desconocido', () => {
      const result = validateTransition('cancelado', 'listo');

      expect(result.ok).toBe(false);
      expect(result.reason).toMatch(/no es válido/i);
    });
  });

  describe('FOOD-03 CA3: pedido ya entregado', () => {
    it.each([['recibido'], ['en preparación'], ['listo'], ['entregado'], ['cancelado']])(
      'rechaza cualquier cambio desde "entregado" (destino "%s") informando que ya fue entregado',
      (target) => {
        const result = validateTransition('entregado', target);

        expect(result.ok).toBe(false);
        expect(result.reason).toMatch(/ya fue entregado/i);
      },
    );
  });
});
