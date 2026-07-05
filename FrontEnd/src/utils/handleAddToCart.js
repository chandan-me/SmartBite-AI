import { addCartItem, loadCart } from "../services/cartService";

export const handleAddToCart = async ({
    user,
    recipe,
    qty = 1,
    setCart,
}) => {

    if (!user) {

        alert("Please login first");

        return false;
    }

    try {

        await addCartItem(
            user.uid,
            recipe,
            qty
        );

        const updatedCart = await loadCart(user.uid);

        setCart(updatedCart);

        return true;

    } catch (err) {

        console.error(err);

        alert("Unable to add item");

        return false;
    }
};