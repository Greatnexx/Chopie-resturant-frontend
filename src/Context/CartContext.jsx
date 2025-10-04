import { createContext, useContext, useState } from "react";
 import { v4 as uuidv4 } from "uuid";


const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);


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

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
