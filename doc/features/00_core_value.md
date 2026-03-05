# 🎯 The Main Goal of the Application (Core Value)

The goal of **Wait-Light** is not to be just another online food ordering application (Click & Collect), but to **revolutionize on-site wait management**.

**The problem**: In food trucks, bakeries, or fast-food restaurants without kiosks, the customer orders at the counter and then finds themselves stuck waiting standing up listening to a server shout "Number 42!". It is stressful for the merchant, noisy, and unpleasant for the customer.

**The Wait-Light solution**: An instant virtual queue system.
1. The merchant opens the **QR Display** on their tablet or phone, facing the customer line.
2. The customer scans the **rotating QR code** displayed on the screen (no app download needed) and enters their name to join the queue.
3. The customer sees their "virtual ticket" animated in real time on their phone. They can go sit down, take a walk, and receive an alert when it's their turn.
4. The QR code **rotates every 15 seconds** with a cryptographic one-time token — only the person physically in front of the screen can scan and join, preventing fraud and remote queue stuffing.

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
