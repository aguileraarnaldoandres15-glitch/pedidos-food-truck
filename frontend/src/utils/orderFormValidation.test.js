import { describe, it, expect } from 'vitest';
import { validateOrderForm } from './orderFormValidation.js';

const validItem = () => ({ nombre: 'Pancho', cantidad: '2', precioUnitario: '1500' });

const validForm = (overrides = {}) => ({
  cliente: 'Ana',
  items: [validItem()],
  ...overrides,
});

const formWithItem = (itemOverrides) => validForm({ items: [{ ...validItem(), ...itemOverrides }] });

const withoutField = (object, field) => {
  const copy = { ...object };
  delete copy[field];
  return copy;
};

describe('validateOrderForm', () => {
  describe('entrada que no es un objeto', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['un string', 'pedido'],
      ['un número', 42],
      ['un booleano', true],
      ['un array', [validForm()]],
    ])('devuelve isValid false sin lanzar errores cuando recibe %s', (_label, input) => {
      let result;

      expect(() => {
        result = validateOrderForm(input);
      }).not.toThrow();
      expect(result.isValid).toBe(false);
      expect(result.errors.pedido).toEqual(expect.any(String));
      expect(result.data).toBeNull();
    });
  });

  describe('FOOD-05 CA3: formulario válido', () => {
    it('acepta valores de inputs como strings numéricos y los convierte a número', () => {
      const result = validateOrderForm(validForm());

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.data).toEqual({
        cliente: 'Ana',
        items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }],
      });
    });

    it('acepta cantidad y precio que ya son números', () => {
      const result = validateOrderForm(formWithItem({ cantidad: 3, precioUnitario: 800 }));

      expect(result.isValid).toBe(true);
      expect(result.data.items[0]).toEqual({ nombre: 'Pancho', cantidad: 3, precioUnitario: 800 });
    });

    it('normaliza con trim el cliente y el nombre de cada ítem', () => {
      const result = validateOrderForm(validForm({ cliente: '  Ana  ', items: [{ ...validItem(), nombre: ' Pancho  ' }] }));

      expect(result.data.cliente).toBe('Ana');
      expect(result.data.items[0].nombre).toBe('Pancho');
    });

    it('acepta un precio unitario decimal', () => {
      const result = validateOrderForm(formWithItem({ precioUnitario: '1500.5' }));

      expect(result.isValid).toBe(true);
      expect(result.data.items[0].precioUnitario).toBe(1500.5);
    });

    it('no incluye un total en los datos a enviar', () => {
      const result = validateOrderForm(validForm({ total: 1 }));

      expect(result.data).not.toHaveProperty('total');
    });
  });

  describe('FOOD-05 CA3: cliente obligatorio', () => {
    it.each([
      ['vacío', ''],
      ['solo espacios', '   '],
      ['null', null],
    ])('rechaza el cliente cuando es %s', (_label, cliente) => {
      const result = validateOrderForm(validForm({ cliente }));

      expect(result.isValid).toBe(false);
      expect(result.errors.cliente).toEqual(expect.any(String));
    });

    it('rechaza el formulario cuando falta el cliente', () => {
      const result = validateOrderForm(withoutField(validForm(), 'cliente'));

      expect(result.isValid).toBe(false);
      expect(result.errors.cliente).toEqual(expect.any(String));
    });
  });

  describe('FOOD-05 CA3: al menos un ítem', () => {
    it.each([
      ['un array vacío', []],
      ['null', null],
      ['un string', 'pancho'],
    ])('rechaza los ítems cuando son %s', (_label, items) => {
      const result = validateOrderForm(validForm({ items }));

      expect(result.isValid).toBe(false);
      expect(result.errors.items).toEqual(expect.any(String));
    });

    it('rechaza el formulario cuando falta el campo items', () => {
      const result = validateOrderForm(withoutField(validForm(), 'items'));

      expect(result.isValid).toBe(false);
      expect(result.errors.items).toEqual(expect.any(String));
    });

    it('rechaza un ítem que no es un objeto', () => {
      const result = validateOrderForm(validForm({ items: [null] }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0]']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-05 CA3: nombre del ítem', () => {
    it.each([
      ['vacío', ''],
      ['solo espacios', '  '],
    ])('rechaza el nombre del ítem cuando es %s', (_label, nombre) => {
      const result = validateOrderForm(formWithItem({ nombre }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].nombre']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-05 CA3: cantidad', () => {
    it.each([
      ['vacía', ''],
      ['"0"', '0'],
      ['negativa', -1],
      ['decimal', '1.5'],
      ['no numérica', 'abc'],
      ['null', null],
    ])('rechaza la cantidad cuando es %s', (_label, cantidad) => {
      const result = validateOrderForm(formWithItem({ cantidad }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].cantidad']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-05 CA3: precio unitario', () => {
    it.each([
      ['vacío', ''],
      ['"0"', '0'],
      ['negativo', -5],
      ['no numérico', 'abc'],
      ['null', null],
    ])('rechaza el precio unitario cuando es %s', (_label, precioUnitario) => {
      const result = validateOrderForm(formWithItem({ precioUnitario }));

      expect(result.isValid).toBe(false);
      expect(result.errors['items[0].precioUnitario']).toEqual(expect.any(String));
    });
  });

  describe('FOOD-05 CA3: varios errores', () => {
    it('reporta todos los errores a la vez para mostrarlos junto al formulario', () => {
      const result = validateOrderForm({
        cliente: '   ',
        items: [{ nombre: '', cantidad: '0', precioUnitario: '' }],
      });

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).sort()).toEqual(
        ['cliente', 'items[0].cantidad', 'items[0].nombre', 'items[0].precioUnitario'].sort(),
      );
    });
  });
});
