import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Initialize Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Menu endpoints
app.get('/menu', async (c) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.log(`Error fetching menu: ${error.message}`);
      return c.json({ error: 'Failed to fetch menu' }, 500);
    }

    return c.json({ items: data ?? [] });
  } catch (error) {
    console.log(`Error fetching menu: ${error}`);
    return c.json({ error: 'Failed to fetch menu' }, 500);
  }
});

// Order endpoints
app.post('/orders', async (c) => {
  try {
    const orderData = await c.req.json();
    if (!orderData.items || !Array.isArray(orderData.items)) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get next queue number
    const { data: nextQueue, error: queueError } = await supabase.rpc('get_next_queue_number');
    if (queueError) {
      console.log(`Error getting next queue number: ${queueError.message}`);
      return c.json({ error: 'Failed to get next queue number' }, 500);
    }

    const queueNumber = nextQueue || 1;

    // Insert order
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        queue_number: queueNumber,
        total: orderData.total ?? 0,
        order_notes: orderData.orderNotes ?? null,
        user_id: orderData.userId || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (orderError) {
      const msg = orderError.message.includes('orders_unique_active_queue_number')
        ? 'Queue number already taken'
        : 'Failed to create order';
      console.log(`Error creating order: ${orderError.message}`);
      return c.json({ error: msg }, 400);
    }

    // Insert items
    const itemsPayload = orderData.items.map((it: any) => ({
      order_id: orderRow.id,
      name: it.name,
      price: it.price,
      category: it.category,
      customizations: it.customizations ?? null,
    }));

    if (itemsPayload.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.log(`Error inserting order items: ${itemsError.message}`);
        // Best-effort cleanup (soft-delete order)
        await supabase.from('orders').delete().eq('id', orderRow.id);
        return c.json({ error: 'Failed to create order items' }, 500);
      }
    }

    // Fetch items back
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

    console.log(`Order created successfully - ID: ${responseOrder.id}, Queue: ${responseOrder.queueNumber}`);
    return c.json({ order: responseOrder });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

app.get('/orders', async (c) => {
  try {
    const statusParam = c.req.query('status');

    const query = supabase
      .from('orders')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    const { data: orderRows, error: ordersError } = statusParam
      ? await query.eq('status', statusParam)
      : await query;

    if (ordersError) {
      console.log(`Error fetching orders: ${ordersError.message}`);
      return c.json({ error: 'Failed to fetch orders' }, 500);
    }

    if (!orderRows || orderRows.length === 0) {
      return c.json({ orders: [] });
    }

    const orderIds = orderRows.map((o) => o.id);
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.log(`Error fetching order items: ${itemsError.message}`);
      return c.json({ error: 'Failed to fetch orders' }, 500);
    }

    const itemsByOrder: Record<string, any[]> = {};
    for (const it of items ?? []) {
      itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || [];
      itemsByOrder[it.order_id].push(it);
    }

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
    
    return c.json({ orders });
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

app.put('/orders/:id/status', async (c) => {
  try {
    const orderId = c.req.param('id');
    const { status } = await c.req.json();
    
    const allowed = ['pending', 'preparing', 'ready'];
    if (!allowed.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Fetch current order
    const { data: current, error: fetchErr } = await supabase
      .from('orders')
      .select('id,status')
      .eq('id', orderId)
      .single();

    if (fetchErr || !current) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Enforce simple state machine
    const from = current.status;
    const valid = (from === 'pending' && status === 'preparing') ||
                  (from === 'preparing' && status === 'ready') ||
                  (from === status); // allow idempotent update
    if (!valid) {
      return c.json({ error: `Invalid transition ${from} -> ${status}` }, 400);
    }

    // Update order
    const { data: updated, error: updErr } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updErr) {
      console.log(`Error updating status: ${updErr.message}`);
      return c.json({ error: 'Failed to update order status' }, 500);
    }

    // Insert status history (best-effort)
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      from_status: from,
      to_status: status,
      changed_by: updated.user_id,
    });

    // Return order with items
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
    return c.json({ order: responseOrder });
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});

app.delete('/orders/:id', async (c) => {
  try {
    const orderId = c.req.param('id');
    
    const { error: updErr } = await supabase
      .from('orders')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updErr) {
      console.log(`Error archiving order: ${updErr.message}`);
      return c.json({ error: 'Failed to archive order' }, 500);
    }
    
    console.log(`Order ${orderId} archived successfully`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error archiving order: ${error}`);
    return c.json({ error: 'Failed to archive order' }, 500);
  }
});

// Queue number management
app.get('/queue/next', async (c) => {
  try {
    const { data, error } = await supabase.rpc('get_next_queue_number');
    if (error) {
      console.log(`Error getting next queue number: ${error.message}`);
      return c.json({ error: 'Failed to get next queue number' }, 500);
    }

    return c.json({ queueNumber: data ?? 1 });
  } catch (error) {
    console.log(`Error getting next queue number: ${error}`);
    return c.json({ error: 'Failed to get next queue number' }, 500);
  }
});

// Health check
app.get('/health', async (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all for better error handling
app.all('*', (c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

console.log('Restaurant order management server starting...');
Deno.serve(app.fetch);
