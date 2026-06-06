let io;

export const initSocketService = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`👑 Admin joined: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const emitNewOrder = (order) => {
  if (io) {
    io.to('admin_room').emit('new_order', {
      orderId: order.orderId,
      customerName: order.customer.name,
      phone: order.customer.phone,
      total: order.total,
      orderTime: order.createdAt || new Date(),
      itemCount: order.items.length,
    });
  }
};

export const emitOrderStatusUpdate = (order) => {
  if (io) {
    io.emit(`order_update_${order.orderId}`, {
      orderId: order.orderId,
      status: order.status,
      updatedAt: new Date(),
    });
  }
};
