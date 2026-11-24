import { describe, it, expect } from 'vitest';
import { validateOrder } from './orderValidation.js';

const validItem = () => ({ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 });

const validOrder = (overrides = {}) => ({
  cliente: 'Ana',
  items: [validItem()],
  ...overrides,
});

const orderWithItem = (itemOverrides) => validOrder({ items: [{ ...validItem(), ...itemOverrides }] });

const withoutField = (object, field) => {
  const copy = { ...object };
  delete copy[field];
  return copy;
};

describe('validateOrder', () => {
  describe('entrada que no es un objeto', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['un string', 'pedido'],
      ['un número', 42],
      ['un booleano', true],
      ['un array', [validOrder()]],
    ])('devuelve isValid false sin lanzar errores cuando recibe %s', (_label, input) => {
      let result;

      expect(() => {
        result = validateOrder(input);
      }).not.toThrow();
      expect(result.isValid).toBe(false);
      expect(result.errors.pedido).toEqual(expect.any(String));
      expect(result.data).toBeNull();
    });
  });

  describe('FOOD-01 CA1: pedido válido y normalización', () => {
    it('acepta un pedido mínimo válido sin errores', () => {
      const result = validateOrder(validOrder());

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toEqual({
        cliente: 'Ana',
        items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }],
      });
    });

    it('normaliza con trim el nombre del cliente y el nombre de cada ítem', () => {
      const result = validateOrder({
        cliente: '  Ana  ',
        items: [{ nombre: '  Pancho ', cantidad: 1, precioUnitario: 1500 }],
      });

      expect(result.isValid).toBe(true);
      expect(result.data.cliente).toBe('Ana');
      expect(result.data.items[0].nombre).toBe('Pancho');
    });

    it('acepta un precio unitario decimal', () => {
      const result = validateOrder(orderWithItem({ precioUnitario: 1500.5 }));

      expect(result.isValid).toBe(true);
    });

    it('acepta pedidos con varios ítems válidos', () => {
      const result = validateOrder(
        validOrder({
          items: [validItem(), { nombre: 'Gaseosa', cantidad: 1, precioUnitario: 800 }],
        }),
      );

      expect(result.isValid).toBe(true);
      expect(result.data.items).toHaveLength(2);
    });
  });

  describe('FOOD-01 CA1: cliente', () => {
    it.each([
      ['vacío', ''],
      ['solo espacios', '   '],
      ['un número', 123],
      ['null', null],
    ])('rechaza el cliente cuando es %s', (_label, cliente) => {
      const result = validateOrder(validOrder({ cliente }));

      expect(result.isValid).toBe(false);
      expect(result.errors.cliente).toEqual(expect.any(String));
      expect(result.data).toBeNull();
    });

    it('rechaza el pedido cuando falta el campo cliente', () => {
      const result = validateOrder(withoutField(validOrder(), 'cliente'));

      expect(result.isValid).toBe(false);
      expect(result.errors.cliente).toEqual(expect.any(String));
    });
  });

  describe('FOOD-01 CA1: lista de ítems', () => {
    it.each([
      ['un array vacío', []],
      ['un string', 'pancho'],
      ['null', null],
      ['un objeto', {}],
    ])('rechaza los ítems cuando son %s', (_label, items) => {
      const result = validateOrder(validOrder({ items }));

      expect(result.isValid).toBe(false);
      expect(result.errors.items).toEqual(expect.any(String));
    });

    it('rechaza el pedido cuando falta el campo items', () => {
      const result = validateOrder(withoutField(validOrder(), 'items'));

      expect(result.isValid).toBe(false);
      expect(result.errors.items).toEqual(expect.any(String));
    });

    it.each([
      ['null', null],
      ['un string', 'x'],
      ['un número', 5],
    ])('rechaza un ítem que es %s', (_label, item) => {
      const result = validateOrder(validOrder({ items: [item] }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0]']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-01 CA1: nombre del ítem', () => {
    it.each([
      ['vacío', ''],
      ['solo espacios', '   '],
      ['null', null],
    ])('rechaza el nombre del ítem cuando es %s', (_label, nombre) => {
      const result = validateOrder(orderWithItem({ nombre }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].nombre']).toEqual(expect.any(String));
    });

    it('rechaza el ítem cuando falta el nombre', () => {
      const result = validateOrder(validOrder({ items: [withoutField(validItem(), 'nombre')] }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].nombre']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-01 CA1: cantidad', () => {
    it.each([
      ['0', 0],
      ['negativa', -1],
      ['decimal', 1.5],
      ['un string numérico', '2'],
      ['null', null],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
    ])('rechaza la cantidad cuando es %s', (_label, cantidad) => {
      const result = validateOrder(orderWithItem({ cantidad }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].cantidad']).toEqual(expect.any(String));
    });

    it('rechaza el ítem cuando falta la cantidad', () => {
      const result = validateOrder(validOrder({ items: [withoutField(validItem(), 'cantidad')] }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].cantidad']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-01 CA1: precio unitario', () => {
    it.each([
      ['0', 0],
      ['negativo', -100],
      ['un string numérico', '1500'],
      ['null', null],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
    ])('rechaza el precio unitario cuando es %s', (_label, precioUnitario) => {
      const result = validateOrder(orderWithItem({ precioUnitario }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].precioUnitario']).toEqual(expect.any(String));
    });

    it('rechaza el ítem cuando falta el precio unitario', () => {
      const result = validateOrder(validOrder({ items: [withoutField(validItem(), 'precioUnitario')] }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].precioUnitario']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-01 CA1: varios ítems y varios errores', () => {
    it('identifica solo el ítem inválido cuando hay varios', () => {
      const result = validateOrder(
        validOrder({
          items: [validItem(), { ...validItem(), cantidad: 0 }, validItem()],
        }),
      );

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toEqual(['items[1].cantidad']);
    });

    it('reporta todos los errores a la vez', () => {
      const result = validateOrder({
        cliente: '',
        items: [{ nombre: 'Pancho', cantidad: 0, precioUnitario: -1 }],
      });

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).sort()).toEqual(
        ['cliente', 'items[0].cantidad', 'items[0].precioUnitario'].sort(),
      );
    });
  });

  describe('FOOD-01 CA2: campos enviados por el cliente que se ignoran', () => {
    it('descarta el total enviado desde el cliente', () => {
      const result = validateOrder(validOrder({ total: 1 }));

      expect(result.isValid).toBe(true);
      expect(result.data).not.toHaveProperty('total');
    });

    it('descarta el estado y la fecha enviados desde el cliente', () => {
      const result = validateOrder(validOrder({ estado: 'entregado', fecha: '2020-01-01' }));

      expect(result.isValid).toBe(true);
      expect(result.data).not.toHaveProperty('estado');
      expect(result.data).not.toHaveProperty('fecha');
    });

    it('descarta campos extra dentro de cada ítem', () => {
      const result = validateOrder(orderWithItem({ subtotal: 999 }));

      expect(result.data.items[0]).toEqual({ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 });
    });
  });
});
