import toast from "react-hot-toast";

export const openRazorpay = ({
    amount,
    user,
    onSuccess,
    onFailure,
}) => {

    if (!window.Razorpay) {

        toast.error("Razorpay SDK not loaded.");

        return;

    }

    const options = {

        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amount * 100,

        currency: "INR",

        name: "SmartBite AI",

        description: "Food Order",

        image: "/logo.png",

        prefill: {

            name: user?.displayName || "",

            email: user?.email || "",

        },

        theme: {

            color: "#ff6b00",

        },

        handler(response) {

            onSuccess(response);

        },

        modal: {

            ondismiss() {

                onFailure();

            }

        }

    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();

};