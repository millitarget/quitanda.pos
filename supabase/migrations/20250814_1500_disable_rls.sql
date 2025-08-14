-- Disable RLS on all tables for the restaurant app
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history DISABLE ROW LEVEL SECURITY;

-- Make user_id nullable in orders table
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add sample menu items
INSERT INTO public.menu_items (id, name, price, category, description) VALUES
('1', 'Frango do Churrasco', 7.90, 'Carne', NULL),
('2', '1/2 Frango do Churrasco', 4.50, 'Carne', NULL),
('3', 'Frango da Guia (Galeto)', 8.00, 'Carne', NULL),
('4', 'Espetada de Porco', 6.50, 'Carne', NULL),
('5', 'Espetada de Frango c/ Bacon', 6.50, 'Carne', NULL),
('6', 'Dose de Entrecosto', 8.00, 'Carne', NULL),
('7', '1/2 Dose de Entrecosto', 4.50, 'Carne', NULL),
('8', 'Salsicha Toscana', 2.00, 'Carne', NULL),
('9', 'Fêvera de Porco', 6.00, 'Carne', NULL),
('10', 'Costeleta de Vitela', 25.00, 'Carne', '€/kg'),
('11', 'Costeleta de Porco', 6.00, 'Carne', NULL),
('12', 'Coelho', 12.50, 'Carne', NULL),
('13', 'Costelinha', 19.00, 'Carne', '€/kg'),
('14', 'Picanha', 36.50, 'Carne', '€/kg'),
('15', 'Bife do Lombo', 40.00, 'Carne', '€/kg'),
('16', 'Bacalhau 1P', 19.50, 'Peixe', 'c/ batata, ovo, pimento, cebola'),
('17', 'Bacalhau 2P', 32.50, 'Peixe', 'c/ batata, ovo, pimento, cebola'),
('18', 'Dose de Batata Frita', 3.75, 'Acompanhamentos', NULL),
('19', '1/2 Dose de Batata Frita', 2.50, 'Acompanhamentos', NULL),
('20', 'Pacote de Batata Barrosa', 3.00, 'Acompanhamentos', NULL),
('21', 'Dose de Arroz', 3.75, 'Acompanhamentos', NULL),
('22', '1/2 Dose de Arroz', 2.50, 'Acompanhamentos', NULL),
('23', 'Salada Mista', 4.00, 'Acompanhamentos', NULL),
('24', '1/2 Salada Mista', 2.75, 'Acompanhamentos', NULL),
('25', 'Salada de Tomate', 4.00, 'Acompanhamentos', NULL),
('26', 'Salada de Alface', 4.00, 'Acompanhamentos', NULL),
('27', 'Salada de Pimentos', 4.50, 'Acompanhamentos', NULL),
('28', 'Dose de Feijão Preto', 5.75, 'Acompanhamentos', NULL),
('29', '1/2 Dose de Feijão Preto', 3.95, 'Acompanhamentos', NULL),
('30', 'Espargado Grelos/Espinafres', 5.50, 'Acompanhamentos', NULL),
('31', 'Broa de Milho', 1.90, 'Acompanhamentos', NULL),
('32', '1/2 Broa de Milho', 1.00, 'Acompanhamentos', NULL),
('33', 'Broa de Avintes', 3.50, 'Acompanhamentos', NULL),
('34', '1/2 Broa de Avintes', 2.00, 'Acompanhamentos', NULL),
('35', 'Trança (Cacete)', 1.80, 'Acompanhamentos', NULL),
('36', 'Vinho Casa Cruzeiro', 4.00, 'Vinhos', NULL),
('37', 'Vinho Branco Monção', 7.00, 'Vinhos', NULL),
('38', 'Vinho Branco Casal', 7.00, 'Vinhos', NULL),
('39', 'Vinho Porta Ravessa', 4.50, 'Vinhos', NULL),
('40', 'Vinho Gaseificado', 5.50, 'Vinhos', NULL),
('41', 'Vinho Monte Velho', 7.00, 'Vinhos', NULL),
('42', 'Vinho Eugénio Almeida', 7.00, 'Vinhos', NULL),
('43', 'Refrigerantes 1L', 2.75, 'Bebidas', NULL),
('44', 'Refrigerantes 1.5L', 3.00, 'Bebidas', NULL);
