
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/carts`;

// Get a particular user's cart
export const getUserCart = async (userId) => {
  const response = await axios.get(API_URL, {
    params: {
      userId,
    },
  });

  return response.data[0] || null;
};

// Create a new cart
export const createCart = async (userId) => {
  const response = await axios.post(API_URL, {
    userId,
    items: [],
  });

  return response.data;
};

// Add product to cart
export const addToCart = async (userId, product) => {
  let cart = await getUserCart(userId);

  if (!cart) {
    cart = await createCart(userId);
  }

  const existingItem = cart.items.find(
    (item) => String(item.productId) === String(product.id)
  );

  let updatedItems;

  if (existingItem) {
    updatedItems = cart.items.map((item) =>
      String(item.productId) === String(product.id)
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );
  } else {
    updatedItems = [
      ...cart.items,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: 1,
      },
    ];
  }

  const response = await axios.patch(
    `${API_URL}/${cart.id}`,
    {
      items: updatedItems,
    }
  );

  return response.data;
};

// Update cart items
export const updateCart = async (cartId, items) => {
  const response = await axios.patch(
    `${API_URL}/${cartId}`,
    {
      items,
    }
  );

  return response.data;
};

// Remove cart item
export const removeCartItem = async (cartId, items) => {
  return updateCart(cartId, items);
};
