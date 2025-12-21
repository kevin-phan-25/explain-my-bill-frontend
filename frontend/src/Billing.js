import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "../api";

const stripePromise = loadStripe("pk_test_YourStripePublishableKey"); // Replace with your real publishable key

export default function Billing() {
  const handleCheckout = async (plan) => {
    try {
      const { id } = await createCheckoutSession(plan);
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) console.error(error);
    } catch (err) {
      alert("Payment setup failed. Check console.");
    }
  };

  return (
    <div style={{ margin: "40px 0", padding: "30px", background: "#f0f8ff", borderRadius: "10px", textAlign: "center" }}>
      <h2>Unlock Full Detailed Explanations</h2>
      <p>Get unlimited access or pay per bill.</p>
      <button onClick={() => handleCheckout("one-time")} style={{ margin: "10px", padding: "15px 30px", fontSize: "16px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        $4.99 – One Bill Explanation
      </button>
      <button onClick={() => handleCheckout("monthly")} style={{ margin: "10px", padding: "15px 30px", fontSize: "16px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        $15.99/month – Unlimited
      </button>
    </div>
  );
}
