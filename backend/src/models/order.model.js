import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../utils/orderStatus.js';

const itemSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre del ítem es obligatorio'], trim: true },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser mayor a 0'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero',
      },
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      validate: {
        validator: (value) => value > 0,
        message: 'El precio unitario debe ser mayor a 0',
      },
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    cliente: { type: String, required: [true, 'El nombre del cliente es obligatorio'], trim: true },
    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'El pedido debe tener al menos un ítem',
      },
    },
    total: { type: Number, required: [true, 'El total es obligatorio'] },
    estado: {
      type: String,
      enum: { values: ORDER_STATUSES, message: 'El estado "{VALUE}" no es válido' },
      default: ORDER_STATUSES[0],
    },
    fecha: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const Order = mongoose.model('Pedido', orderSchema);
