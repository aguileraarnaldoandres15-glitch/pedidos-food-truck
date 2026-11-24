import { describe, it, expect } from 'vitest';
import { calculateTotal } from './orderTotal.js';

describe('calculateTotal', () => {
  describe('FOOD-01 CA2: total calculado en el backend', () => {
    it('calcula el total de un solo ítem', () => {
      expect(calculateTotal([{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }])).toBe(3000);
    });

    it('suma cantidad por precio unitario de varios ítems', () => {
      const items = [
        { nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 },
        { nombre: 'Gaseosa', cantidad: 1, precioUnitario: 800 },
        { nombre: 'Papas', cantidad: 3, precioUnitario: 500 },
      ];

      expect(calculateTotal(items)).toBe(5300);
    });

    it('redondea a 2 decimales para evitar errores de punto flotante', () => {
      expect(calculateTotal([{ nombre: 'Caramelo', cantidad: 3, precioUnitario: 0.1 }])).toBe(0.3);
    });

    it('calcula correctamente con precios decimales', () => {
      expect(calculateTotal([{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500.5 }])).toBe(3001);
    });

    it('devuelve 0 para una lista vacía', () => {
      expect(calculateTotal([])).toBe(0);
    });
  });
});
