import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

// Direct Supabase database calls with workarounds for RLS
export const ordersApi = {
  async getOrders(status?: string): Promise<any> {
    try {
      console.log('Fetching orders directly from database...');
      
      let query = supabase
        .from('orders')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: orderRows, error: ordersError } = await query;

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        // Return empty array if RLS blocks access
        if (ordersError.message.includes('row-level security')) {
          console.warn('RLS blocking access, returning empty orders');
          return { orders: [] };
        }
        throw new Error('Failed to fetch orders');
      }

      if (!orderRows || orderRows.length === 0) {
        return { orders: [] };
      }

      // Fetch order items for all orders
      const orderIds = orderRows.map((o) => o.id);
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        // Continue without items if RLS blocks access
        if (itemsError.message.includes('row-level security')) {
          console.warn('RLS blocking order items access');
        } else {
          throw new Error('Failed to fetch orders');
        }
      }

      // Group items by order
      const itemsByOrder: Record<string, any[]> = {};
      for (const it of items ?? []) {
        itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || [];
        itemsByOrder[it.order_id].push(it);
      }

      // Transform to match expected format
      const orders = orderRows.map((row) => ({
        id: row.id,
        queueNumber: row.queue_number,
        items: (itemsByOrder[row.id] || []).map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          category: it.category,
          customizations: it.customizations ?? {},
        })),
        timestamp: row.created_at,
        status: row.status,
        total: row.total,
        orderNotes: row.order_notes ?? undefined,
        userId: row.user_id,
      }));

      return { orders };
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  },

  async createOrder(orderData: any): Promise<any> {
    try {
      console.log('Creating order directly in database...');
      
      // Use the queue number from the order data, or generate one if not provided
      let queueNumber = orderData.queueNumber || orderData.queue_number;
      
      if (!queueNumber) {
        // Get next queue number only if not provided
        const { data: nextQueue, error: queueError } = await supabase.rpc('get_next_queue_number');
        
        if (queueError) {
          console.error('Error getting next queue number:', queueError);
          // Use a simple fallback if RPC fails
          const { data: existingOrders } = await supabase
            .from('orders')
            .select('queue_number')
            .is('archived_at', null)
            .order('queue_number', { ascending: false })
            .limit(1);
          
          queueNumber = existingOrders && existingOrders.length > 0 
            ? existingOrders[0].queue_number + 1 
            : 1;
          
          console.log(`Using fallback queue number: ${queueNumber}`);
        } else {
          queueNumber = nextQueue || 1;
        }
      }
      
      console.log(`Using queue number: ${queueNumber} (from order data: ${orderData.queueNumber || orderData.queue_number})`);

      // Insert order without user_id (make it nullable)
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          queue_number: queueNumber,
          total: orderData.total ?? 0,
          order_notes: orderData.orderNotes ?? null,
          user_id: null, // Make user_id nullable
          status: 'pending',
        })
        .select('*')
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        if (orderError.message.includes('row-level security')) {
          throw new Error('Database access blocked by security policies. Please contact administrator.');
        }
        throw new Error(orderError.message.includes('orders_unique_active_queue_number')
          ? 'Queue number already taken'
          : 'Failed to create order');
      }

      // Insert order items
      if (orderData.items && orderData.items.length > 0) {
        const itemsPayload = orderData.items.map((it: any) => ({
          order_id: orderRow.id,
          name: it.name,
          price: it.price,
          category: it.category,
          customizations: it.customizations ?? null,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsPayload);

        if (itemsError) {
          console.error('Error inserting order items:', itemsError);
          if (itemsError.message.includes('row-level security')) {
            throw new Error('Database access blocked by security policies. Please contact administrator.');
          }
          // Cleanup order if items fail
          await supabase.from('orders').delete().eq('id', orderRow.id);
          throw new Error('Failed to create order items');
        }
      }

      // Fetch created order with items
      const { data: insertedItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderRow.id);

      const responseOrder = {
        id: orderRow.id,
        queueNumber: orderRow.queue_number,
        items: (insertedItems ?? []).map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          category: it.category,
          customizations: it.customizations ?? {},
        })),
        timestamp: orderRow.created_at,
        status: orderRow.status,
        total: orderRow.total,
        orderNotes: orderRow.order_notes ?? undefined,
        userId: orderRow.user_id,
      };

      console.log('Order created successfully:', responseOrder);
      return { order: responseOrder };
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      console.log(`Updating order ${orderId} status to ${status}...`);
      
      // Fetch current order
      const { data: current, error: fetchErr } = await supabase
        .from('orders')
        .select('id,status')
        .eq('id', orderId)
        .single();

      if (fetchErr || !current) {
        throw new Error('Order not found');
      }

      // Validate status transition
      const from = current.status;
      const valid = (from === 'pending' && status === 'preparing') ||
                    (from === 'preparing' && status === 'ready') ||
                    (from === status);
      if (!valid) {
        throw new Error(`Invalid transition ${from} -> ${status}`);
      }

      // Update order
      const { data: updated, error: updErr } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('*')
        .single();

      if (updErr) {
        if (updErr.message.includes('row-level security')) {
          throw new Error('Database access blocked by security policies. Please contact administrator.');
        }
        throw new Error('Failed to update order status');
      }

      // Insert status history
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        from_status: from,
        to_status: status,
        changed_by: updated.user_id,
      });

      // Return updated order with items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      const responseOrder = {
        id: updated.id,
        queueNumber: updated.queue_number,
        items: (items ?? []).map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          category: it.category,
          customizations: it.customizations ?? {},
        })),
        timestamp: updated.created_at,
        status: updated.status,
        total: updated.total,
        orderNotes: updated.order_notes ?? undefined,
        userId: updated.user_id,
      };

      console.log(`Order ${orderId} status updated to ${status}`);
      return { order: responseOrder };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  },

  async deleteOrder(orderId: string): Promise<any> {
    try {
      console.log(`Archiving order ${orderId}...`);
      
      const { error: updErr } = await supabase
        .from('orders')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updErr) {
        if (updErr.message.includes('row-level security')) {
          throw new Error('Database access blocked by security policies. Please contact administrator.');
        }
        throw new Error('Failed to archive order');
      }
      
      console.log(`Order ${orderId} archived successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      throw error;
    }
  }
};

export const menuApi = {
  async getMenu(): Promise<any> {
    try {
      console.log('Fetching menu directly from database...');
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching menu:', error);
        if (error.message.includes('row-level security')) {
          console.warn('RLS blocking menu access, returning empty menu');
          return { items: [] };
        }
        throw new Error('Failed to fetch menu');
      }

      return { items: data ?? [] };
    } catch (error) {
      console.error('Error in getMenu:', error);
      throw error;
    }
  }
};

export const queueApi = {
  async getNextQueueNumber(): Promise<any> {
    try {
      console.log('Getting next queue number directly from database...');
      
      const { data, error } = await supabase.rpc('get_next_queue_number');
      if (error) {
        console.error('Error getting next queue number:', error);
        // Use a simple fallback if RPC fails
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('queue_number')
          .is('archived_at', null)
          .order('queue_number', { ascending: false })
          .limit(1);
        
        const queueNumber = existingOrders && existingOrders.length > 0 
          ? existingOrders[0].queue_number + 1 
          : 1;
        
        console.log(`Using fallback queue number: ${queueNumber}`);
        return { queueNumber };
      }

      return { queueNumber: data ?? 1 };
    } catch (error) {
      console.error('Error in getNextQueueNumber:', error);
      throw error;
    }
  }
};

export const healthApi = {
  async checkHealth(): Promise<any> {
    try {
      // Test database connection by trying to access a table
      const { data, error } = await supabase
        .from('orders')
        .select('count')
        .limit(1);

      if (error) {
        if (error.message.includes('row-level security')) {
          throw new Error('Database access blocked by security policies');
        }
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};