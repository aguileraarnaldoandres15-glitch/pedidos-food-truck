import { describe, it } from 'vitest';

// Tests de componente pendientes: se implementan junto con OrderList.jsx.

describe('OrderList', () => {
  describe('FOOD-02 CA3: detalle de cada pedido', () => {
    it.todo('muestra cliente, ítems con nombre y cantidad (ej. "2 × Pancho"), total, estado y fecha/hora');
  });

  describe('FOOD-04 CA2: estado diferenciado', () => {
    it.todo('muestra una etiqueta de estado distinta para cada pedido según su estado');
  });

  describe('FOOD-03 CA5: avanzar estado', () => {
    it.todo('al hacer clic en "Avanzar a en preparación" notifica el pedido y el siguiente estado');
    it.todo('no muestra el botón de avanzar en un pedido entregado');
  });
});
