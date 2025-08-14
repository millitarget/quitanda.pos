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

// Disable RLS endpoint
app.post('/disable-rls', async (c) => {
  try {
    console.log('Disabling RLS on all tables...');
    
    // Disable RLS on all tables
    const { error: menuError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;'
    });
    
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;'
    });
    
    const { error: itemsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;'
    });
    
    const { error: historyError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.order_status_history DISABLE ROW LEVEL SECURITY;'
    });

    if (menuError || ordersError || itemsError || historyError) {
      console.log('Errors disabling RLS:', { menuError, ordersError, itemsError, historyError });
      return c.json({ 
        error: 'Failed to disable RLS',
        details: { menuError, ordersError, itemsError, historyError }
      }, 500);
    }

    console.log('RLS disabled successfully on all tables');
    return c.json({ success: true, message: 'RLS disabled on all tables' });
  } catch (error) {
    console.log(`Error disabling RLS: ${error}`);
    return c.json({ error: 'Failed to disable RLS' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('Disable RLS function starting...');
Deno.serve(app.fetch);
