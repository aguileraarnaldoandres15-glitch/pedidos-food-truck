import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { Order } from '../models/order.model.js';
import { calculateTotal } from '../utils/orderTotal.js';
import { connectMemoryDb, clearMemoryDb, disconnectMemoryDb } from '../../test/memoryDb.js';

// Tests de integración con supertest sobre `app` y una base de datos aislada en memoria.
// FOOD-03 a FOOD-05 siguen pendientes y se implementan junto con sus endpoints.

// La primera ejecución puede descargar el binario de MongoDB, por eso el timeout es mayor.
beforeAll(connectMemoryDb, 120_000);
afterEach(clearMemoryDb);
afterAll(disconnectMemoryDb);

const validOrder = () => ({
  cliente: 'Ana',
  items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }],
});

const postOrder = (body) => request(app).post('/api/pedidos').send(body);

const expectValidationError = async (body) => {
  const response = await postOrder(body);

  expect(response.status).toBe(400);
  expect(response.body).toEqual({
    error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
  });
  expect(response.body.error.message.trim()).not.toBe('');
  expect(await Order.countDocuments()).toBe(0);
};

// Inserta un pedido directo en la DB para controlar `estado` y `fecha`.
const insertOrder = ({ cliente = 'Ana', estado = 'recibido', fecha = new Date() } = {}) => {
  const order = validOrder();
  return Order.create({ ...order, cliente, total: calculateTotal(order.items), estado, fecha });
};

const getPending = () => request(app).get('/api/pedidos/pendientes');

describe('POST /api/pedidos', () => {
  describe('FOOD-01 CA2: total calculado en el backend', () => {
    it('ignora el total enviado (total: 1) y responde y guarda el total calculado (3000)', async () => {
      const response = await postOrder({ ...validOrder(), total: 1 });

      expect(response.status).toBe(201);
      expect(response.body.data.total).toBe(3000);

      const saved = await Order.findById(response.body.data._id).lean();
      expect(saved.total).toBe(3000);
    });
  });

  describe('FOOD-01 CA3: creación exitosa', () => {
    it('responde 201 con { data } que incluye _id, cliente, items, total, estado "recibido" y fecha', async () => {
      const response = await postOrder(validOrder());

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(Object.keys(response.body)).toEqual(['data']);
      expect(response.body.data).toEqual({
        _id: expect.any(String),
        cliente: 'Ana',
        items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }],
        total: 3000,
        estado: 'recibido',
        fecha: expect.any(String),
      });
      expect(Number.isNaN(Date.parse(response.body.data.fecha))).toBe(false);
      expect(await Order.countDocuments()).toBe(1);
    });

    it('ignora el estado y la fecha enviados y guarda estado "recibido" con la fecha actual', async () => {
      const before = Date.now();
      const response = await postOrder({ ...validOrder(), estado: 'entregado', fecha: '2020-01-01' });
      const after = Date.now();

      expect(response.status).toBe(201);
      expect(response.body.data.estado).toBe('recibido');

      const saved = await Order.findById(response.body.data._id).lean();
      expect(saved.estado).toBe('recibido');
      expect(saved.fecha.getTime()).toBeGreaterThanOrEqual(before);
      expect(saved.fecha.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('FOOD-01 CA4: datos inválidos', () => {
    it('responde 400 VALIDATION_ERROR cuando falta el cliente y no crea el pedido', async () => {
      const { items } = validOrder();
      await expectValidationError({ items });
    });

    it('responde 400 VALIDATION_ERROR cuando el cliente es solo espacios y no crea el pedido', async () => {
      await expectValidationError({ ...validOrder(), cliente: '   ' });
    });

    it('responde 400 VALIDATION_ERROR cuando items es un array vacío y no crea el pedido', async () => {
      await expectValidationError({ ...validOrder(), items: [] });
    });

    describe('responde 400 VALIDATION_ERROR cuando una cantidad es 0, negativa o decimal y no crea el pedido', () => {
      it.each([0, -1, 1.5])('cantidad: %s', async (cantidad) => {
        await expectValidationError({
          ...validOrder(),
          items: [{ nombre: 'Pancho', cantidad, precioUnitario: 1500 }],
        });
      });
    });

    describe('responde 400 VALIDATION_ERROR cuando un precio unitario es 0 o negativo y no crea el pedido', () => {
      it.each([0, -1])('precioUnitario: %s', async (precioUnitario) => {
        await expectValidationError({
          ...validOrder(),
          items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario }],
        });
      });
    });
  });
});

describe('GET /api/pedidos/pendientes', () => {
  describe('FOOD-02 CA1: solo pedidos no entregados', () => {
    it('devuelve los pedidos en recibido, en preparación y listo, excluyendo los entregados', async () => {
      await insertOrder({ cliente: 'Ana', estado: 'recibido', fecha: new Date('2026-01-01T10:00:00Z') });
      await insertOrder({ cliente: 'Beto', estado: 'en preparación', fecha: new Date('2026-01-01T10:05:00Z') });
      await insertOrder({ cliente: 'Caro', estado: 'listo', fecha: new Date('2026-01-01T10:10:00Z') });
      await insertOrder({ cliente: 'Dani', estado: 'entregado', fecha: new Date('2026-01-01T10:15:00Z') });

      const response = await getPending();

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.map((order) => order.estado)).toEqual(['recibido', 'en preparación', 'listo']);
      expect(response.body.data.map((order) => order.cliente)).not.toContain('Dani');
    });

    it('responde 200 con data: [] cuando todos los pedidos están entregados', async () => {
      await insertOrder({ cliente: 'Ana', estado: 'entregado' });
      await insertOrder({ cliente: 'Beto', estado: 'entregado' });

      const response = await getPending();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: [] });
    });
  });

  describe('FOOD-02 CA2: orden de llegada', () => {
    it('devuelve los pedidos ordenados por fecha ascendente (del más antiguo al más nuevo)', async () => {
      // Se insertan desordenados, con un entregado intercalado.
      await insertOrder({ cliente: 'Tercero', estado: 'listo', fecha: new Date('2026-01-01T12:00:00Z') });
      await insertOrder({ cliente: 'Primero', estado: 'recibido', fecha: new Date('2026-01-01T10:00:00Z') });
      await insertOrder({ cliente: 'Entregado', estado: 'entregado', fecha: new Date('2026-01-01T11:00:00Z') });
      await insertOrder({ cliente: 'Segundo', estado: 'en preparación', fecha: new Date('2026-01-01T11:30:00Z') });

      const response = await getPending();

      expect(response.status).toBe(200);
      expect(response.body.data.map((order) => order.cliente)).toEqual(['Primero', 'Segundo', 'Tercero']);
      expect(response.body.data.map((order) => order.fecha)).toEqual([
        '2026-01-01T10:00:00.000Z',
        '2026-01-01T11:30:00.000Z',
        '2026-01-01T12:00:00.000Z',
      ]);
    });
  });

  describe('FOOD-02 CA3: forma de cada pedido', () => {
    it('cada pedido incluye cliente, items (nombre y cantidad), total, estado y fecha', async () => {
      await insertOrder({ cliente: 'Ana', estado: 'en preparación', fecha: new Date('2026-01-01T10:00:00Z') });

      const response = await getPending();

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(Object.keys(response.body)).toEqual(['data']);
      expect(response.body.data).toEqual([
        {
          _id: expect.any(String),
          cliente: 'Ana',
          items: [{ nombre: 'Pancho', cantidad: 2, precioUnitario: 1500 }],
          total: 3000,
          estado: 'en preparación',
          fecha: '2026-01-01T10:00:00.000Z',
        },
      ]);
    });
  });
});

describe('PATCH /api/pedidos/:id/estado', () => {
  describe('FOOD-03 CA1: avance al estado siguiente', () => {
    it.todo('avanza de recibido a en preparación y responde 200 con el estado actualizado');
    it.todo('avanza de en preparación a listo y responde 200 con el estado actualizado');
    it.todo('avanza de listo a entregado y responde 200 con el estado actualizado');
  });

  describe('FOOD-03 CA2: no se puede saltear ni retroceder', () => {
    it.todo('responde 400 INVALID_TRANSITION al saltear de recibido a listo sin modificar el pedido');
    it.todo('responde 400 INVALID_TRANSITION al retroceder de listo a recibido sin modificar el pedido');
    it.todo('responde 400 cuando el body no tiene estado o el estado no es válido');
    it.todo('solo modifica el estado aunque el body incluya total o cliente');
  });

  describe('FOOD-03 CA3: pedido ya entregado', () => {
    it.todo('responde 400 informando que el pedido ya fue entregado, sin modificarlo');
  });

  describe('FOOD-03 CA4: id inexistente o inválido', () => {
    it.todo('responde 404 NOT_FOUND cuando el id tiene formato válido pero no existe');
    it.todo('responde 400 INVALID_ID cuando el id tiene formato inválido');
  });
});

describe('GET /api/pedidos', () => {
  describe('FOOD-04 CA1: listado completo', () => {
    it.todo('devuelve todos los pedidos sin importar su estado (recibido, en preparación, listo y entregado)');
    it.todo('devuelve los pedidos ordenados por fecha descendente (del más reciente al más antiguo)');
    it.todo('responde 200 con data: [] cuando no hay pedidos');
  });
});

describe('Formato uniforme de respuestas y errores', () => {
  describe('FOOD-05 CA1: contrato { data } / { error: { code, message } }', () => {
    it.todo('las respuestas exitosas tienen solo la clave data');
    it.todo('responde 404 NOT_FOUND con formato { error } para una ruta inexistente');
    it.todo('responde 400 con formato { error } y sin stack ante un JSON malformado');
  });

  describe('FOOD-05 CA2: errores inesperados', () => {
    it.todo('responde 500 INTERNAL_ERROR con mensaje genérico, sin stack ni detalles internos, cuando el service lanza');
  });
});
