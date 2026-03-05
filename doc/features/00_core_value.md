# 🎯 The Main Goal of the Application (Core Value)

The goal of **Wait-Light** is not to be just another online food ordering application (Click & Collect), but to **revolutionize on-site wait management**.

**The problem**: In food trucks, bakeries, or fast-food restaurants without kiosks, the customer orders at the counter and then finds themselves stuck waiting standing up listening to a server shout "Number 42!". It is stressful for the merchant, noisy, and unpleasant for the customer.

**The Wait-Light solution**: An instant virtual queue system.
1. The customer places their order physically.
2. The merchant adds the customer to their "Wait-Light queue" in 1 click.
3. The customer scans a QR code (without downloading an app) and sees their "virtual ticket" animated in real time on their phone. They can go sit down, take a walk, and receive an alert when it's their turn.

## 👥 Target Audience & Use Cases
* **Food Trucks & Pop-up Restaurants**: High volume of orders in a constrained physical space where customers often block the pathway while waiting.
* **Busy Bakeries & Cafes**: Morning rush hours where waiting inside creates congestion.
* **Event Catering & Festivals**: Noisy environments where shouting numbers is completely ineffective.

## 📊 Key Success Metrics
* **For Merchants**: Elimination of the need to shout or physically track down customers. Faster table turnover and reduced counter congestion.
* **For Customers**: Lower perceived wait time, ability to wait comfortably away from the counter, and a general feeling of VIP service without needing to register or download an app.

## 🚫 What Wait-Light is NOT (Out of Scope)
* **Online ordering (The customer pays/builds their menu on their phone)**: This implies a catalog, a cart, live inventory management, Stripe (fees), etc. This breaks the "1 click" simplicity of the product and competes with Uber Eats or McDonald's kiosks. Wait-Light manages the **wait**, not the **sale**.
* **Complex table reservation**: We handle active, on-site, fast-turnaround queues, not long-term bookings.

## 🏗️ Core Architecture & Foundation
* **Frictionless Onboarding**: Customers must be able to join the queue by simply pointing their phone camera at a code. Absolute zero install constraint.
* **Real-time Sync**: The connection between the merchant's tablet and the customer's phone must feel instantaneous (powered by Supabase Realtime).
* **Privacy by Design**: No personal data (PII) is durably stored about the customer. The queue session is highly ephemeral.
