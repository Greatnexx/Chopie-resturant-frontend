 const menuDatas = {
  starters: [
    {
      id: 1,
      name: "Margherita Pizza",
      price: 12.99,
      description:
        "Fresh mozzarella, tomato sauce, basil leaves on a crispy thin crust",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
      category: "starters",
      tags: ["vegetarian", "popular"],
      prepTime: 15,
      allergens: ["gluten", "dairy"],
      customizations: [
        {
          id: "size",
          name: "Size",
          required: true,
          options: [
            { id: "small", name: 'Small (8")', price: 0 },
            { id: "medium", name: 'Medium (12")', price: 3 },
            { id: "large", name: 'Large (16")', price: 5 },
          ],
        },
        {
          id: "crust",
          name: "Crust Type",
          required: false,
          options: [
            { id: "thin", name: "Thin Crust", price: 0 },
            { id: "thick", name: "Thick Crust", price: 1 },
            { id: "stuffed", name: "Cheese Stuffed", price: 2 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Caesar Salad",
      price: 8.99,
      description:
        "Crisp romaine lettuce, parmesan, croutons, and our signature Caesar dressing",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category: "starters",
      tags: ["healthy"],
      prepTime: 10,
      allergens: ["dairy", "eggs", "gluten"],
      nutritionalInfo: {
        calories: 320,
        protein: 12,
        carbs: 24,
        fat: 18,
      },
    },
    {
      id: 3,
      name: "Caesar Salad",
      price: 8.99,
      description:
        "Crisp romaine lettuce, parmesan, croutons, and our signature Caesar dressing",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category: "starters",
      tags: ["healthy"],
      prepTime: 10,
      allergens: ["dairy", "eggs", "gluten"],
      nutritionalInfo: {
        calories: 320,
        protein: 12,
        carbs: 24,
        fat: 18,
      },
    },
  ],
  mains: [
    {
      id: 3,
      name: "BBQ Bacon Burger",
      price: 14.99,
      description:
        "Juicy beef patty, crispy bacon, BBQ sauce, cheddar cheese, onion rings",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
      category: "mains",
      tags: ["spicy", "popular"],
      prepTime: 20,
      allergens: ["gluten", "dairy"],
      customizations: [
        {
          id: "patty",
          name: "Patty Type",
          required: false,
          options: [
            { id: "beef", name: "Beef", price: 0 },
            { id: "chicken", name: "Chicken", price: 0 },
            { id: "veggie", name: "Veggie", price: 0 },
          ],
        },
        {
          id: "spice",
          name: "Spice Level",
          required: false,
          options: [
            { id: "mild", name: "Mild", price: 0 },
            { id: "medium", name: "Medium", price: 0 },
            { id: "hot", name: "Hot", price: 0 },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Pasta Carbonara",
      price: 13.99,
      description:
        "Creamy egg sauce, crispy pancetta, parmesan cheese, black pepper",
      image:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      category: "mains",
      tags: ["pasta"],
      prepTime: 18,
      allergens: ["gluten", "dairy", "eggs"],
    },
  ],
  desserts: [
    {
      id: 5,
      name: "Tiramisu",
      price: 6.99,
      description:
        "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
      image:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
      category: "desserts",
      tags: ["popular"],
      prepTime: 5,
      allergens: ["dairy", "eggs", "gluten"],
    },
  ],
  beverages: [
    {
      id: 6,
      name: "Fresh Orange Juice",
      price: 4.99,
      description: "Freshly squeezed orange juice",
      image:
        "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400",
      category: "beverages",
      tags: ["healthy", "vegan"],
      prepTime: 5,
    },
  ],
};

export default menuDatas;
