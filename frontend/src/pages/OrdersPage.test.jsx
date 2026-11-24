import { describe, it } from 'vitest';

// Tests de página pendientes: se implementan junto con OrdersPage.jsx, simulando src/services/api.js.

describe('OrdersPage', () => {
  describe('FOOD-01 CA5: pedido creado visible y persistente', () => {
    it.todo('cuando api.createOrder resuelve, el nuevo pedido aparece en la lista');
    it.todo('al montarse de nuevo (simula recarga) obtiene los pedidos desde la API y los muestra');
  });

  describe('FOOD-02 CA4 y CA5: estados de la vista de pendientes', () => {
    it.todo('muestra un indicador de carga mientras se obtienen los pendientes');
    it.todo('muestra un mensaje de lista vacía cuando no hay pedidos pendientes');
    it.todo('muestra el message del error cuando falla la consulta a la API');
  });

  describe('FOOD-03 CA5: actualización inmediata del estado', () => {
    it.todo('cuando api.updateOrderStatus resuelve, muestra el nuevo estado sin recargar');
    it.todo('al avanzar un pedido a entregado, deja de mostrarse en la vista de pendientes');
    it.todo('cuando api.updateOrderStatus rechaza, muestra el message del error');
  });

  describe('FOOD-04 CA3: alternar entre pendientes y listado completo', () => {
    it.todo('al elegir "Todos" llama a api.getOrders y muestra el listado completo');
    it.todo('al volver a "Pendientes" llama a api.getPendingOrders y muestra solo los pendientes');
  });

  describe('FOOD-04 CA4: estados de la vista del listado completo', () => {
    it.todo('muestra un indicador de carga mientras se obtiene el listado completo');
    it.todo('muestra un mensaje de lista vacía cuando todavía no hay pedidos');
    it.todo('muestra el message del error cuando falla la consulta a la API');
  });
});
