# 🍽️ Restaurant Order Management System

A modern, responsive restaurant order management system built with React, TypeScript, and Supabase. This system provides an intuitive interface for taking orders, managing kitchen displays, and handling customer interactions with multilingual support.

## ✨ Features

- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🌍 Multilingual Support**: English, Portuguese, and Spanish interface
- **🎯 Advanced Order Customization**: 70+ customization patterns for food and beverages
- **👨‍🍳 Kitchen Display System**: Real-time order management for kitchen staff
- **💳 Interactive Order Taking**: Intuitive interface for staff to take customer orders
- **📊 Real-time Updates**: Live order status updates and notifications
- **🎨 Modern UI**: Beautiful, accessible interface built with Radix UI and Tailwind CSS
- **🔒 Secure Backend**: Powered by Supabase with real-time capabilities

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **State Management**: React Hooks + Context
- **Styling**: Tailwind CSS + CSS Modules
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant-order-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── figma/          # Figma-related components
│   └── ...             # Feature-specific components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and API helpers
├── supabase/            # Supabase configuration and functions
├── styles/              # Global styles and CSS
├── src/                 # Source files
└── public/              # Static assets
```

## 🚀 Deployment

### Vercel Deployment

This project is optimized for Vercel deployment:

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration
3. **Environment Variables**: Add your Supabase environment variables in Vercel
4. **Deploy**: Vercel will automatically build and deploy your application

### Build Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Set up your database schema
3. Configure Row Level Security (RLS) policies
4. Set up authentication if needed
5. Update environment variables with your project credentials

### Customization

The system supports extensive customization through:
- Menu item modifications
- Special instructions
- Dietary requirements
- Preparation methods
- Size and quantity options

## 📱 Usage

### For Staff
- **Order Taking**: Use the intuitive interface to take customer orders
- **Customizations**: Apply modifications and special instructions
- **Order Management**: Track order status and customer preferences

### For Kitchen
- **Order Display**: View real-time order updates
- **Preparation**: Mark orders as prepared
- **Communication**: Receive special instructions and modifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

**Made with ❤️ for better restaurant management**
