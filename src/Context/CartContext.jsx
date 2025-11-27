import { createContext, useContext, useState, useEffect } from "react";
 import { v4 as uuidv4 } from "uuid";


const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [tableNumber, setTableNumber] = useState(() => {
    // Check URL parameter first, then sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlTable = urlParams.get('table');
    if (urlTable) {
      sessionStorage.setItem('tableNumber', urlTable);
      return urlTable;
    }
    return sessionStorage.getItem('tableNumber') || '';
  });

  // Monitor URL changes for table number
  useEffect(() => {
    const checkUrlForTable = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTable = urlParams.get('table');
      if (urlTable && urlTable !== tableNumber) {
        setTableNumber(urlTable);
        sessionStorage.setItem('tableNumber', urlTable);
      }
    };

    // Check on mount and when URL changes
    checkUrlForTable();
    
    // Listen for URL changes (back/forward navigation)
    window.addEventListener('popstate', checkUrlForTable);
    
    return () => {
      window.removeEventListener('popstate', checkUrlForTable);
    };
  }, [tableNumber]);


 const addToCart = (item) => {
   setCartItems((prev) => {
     // find an existing item (same name + instructions)
     const existingIndex = prev.findIndex(
       (i) =>
         i.name === item.name &&
         i.specialInstructions === item.specialInstructions
     );

     if (existingIndex !== -1) {
       // if the same item already exists, just update qty + total
       const updated = [...prev];
       updated[existingIndex].quantity += item.quantity;
       updated[existingIndex].totalPrice += item.totalPrice;
       sessionStorage.setItem("cart", JSON.stringify(updated));
       return updated;
     }

     // otherwise, create a unique entry
     const newCart = [...prev, { ...item, cartId: uuidv4() }];
     sessionStorage.setItem("cart", JSON.stringify(newCart));
     return newCart;
   });
 };


  const removeFromCart = (itemIndex) => {
    setCartItems((prev) => prev.filter((_, i) => i !== itemIndex));
  };

  const clearCart = () => setCartItems([]);

  // Enhanced setTableNumber to persist to sessionStorage
  const setTableNumberWithSession = (number) => {
    setTableNumber(number);
    if (number) {
      sessionStorage.setItem('tableNumber', number);
    } else {
      sessionStorage.removeItem('tableNumber');
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, tableNumber, setTableNumber: setTableNumberWithSession }}
    >
      {children}
    </CartContext.Provider>
  );
};
