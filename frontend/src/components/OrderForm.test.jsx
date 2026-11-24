import { describe, it } from 'vitest';

// Tests de componente pendientes: se implementan junto con OrderForm.jsx, simulando src/services/api.js.

describe('OrderForm', () => {
  describe('FOOD-01 CA5: creación de pedido', () => {
    it.todo('al completar cliente e ítem y enviar, llama a api.createOrder con { cliente, items } sin total');
    it.todo('permite agregar un segundo ítem y envía ambos ítems');
  });

  describe('FOOD-05 CA3: validación antes de enviar', () => {
    it.todo('con cliente vacío muestra el error junto al formulario y no llama a api.createOrder');
    it.todo('sin ítems válidos o con cantidad o precio en 0 muestra el error y no llama a api.createOrder');
  });

  describe('FOOD-05 CA4: error devuelto por la API', () => {
    it.todo('cuando api.createOrder rechaza con { code, message } muestra el message al usuario');
  });
});
