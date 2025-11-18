import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './Context/CartContext.jsx';
import { Provider } from 'react-redux';
import store from './store.js';
import { Toaster } from 'sonner';


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
  <CartProvider>
    <App />
    <Toaster position="top-right" richColors />
  </CartProvider>
  </Provider>
);
