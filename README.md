# Diffed.gg

A three-sided marketplace for competitive gaming services — players hire vetted experts to climb ranked games, with secure checkout, real-time order chat, and fair provider payouts.

**Live:** https://diffed-swart.vercel.app/

## Engineering highlights

- **Cross-game ranking engine.** Games model rank completely differently — some use tiered divisions (Diamond IV → Master → Grandmaster), others use straight ranks. A configuration-driven game-creation engine lets admins onboard any game and define its rank structure without code, normalizing every order's start/target rank onto a common scale for pricing and matching.
- **Multi-currency wallet.** Players load funds via Stripe (and PayPal) into a platform wallet. A currency-exchange service converts at the rate from the day a transaction occurred, not today's rate.
- **Real-time order flow.** Socket.IO powers live order chat between players and providers, plus an auto-refreshing provider queue.
- **Full role + money model.** Player, provider, and admin experiences; provider activation; verification that releases earnings; payouts with a platform-fee split; dispute and refund flows.

## Stack

Next.js · TypeScript · Node.js · PostgreSQL · Stripe · PayPal · Socket.IO

Built end-to-end in ~2 months on a 3-person team.

---

The guide below covers how to use the platform from the Admin, Customer, and Provider perspectives.

## Diffed.gg Product Guide

This guide explains how to use Diffed.gg from three perspectives: Admin, Customer, and Provider. It focuses on what you can do, what to expect, and how the main flows work in everyday use. No technical setup is required to follow this guide.

### What Diffed.gg Is

Diffed.gg connects customers who want help with gaming (coaching, boosting, playing together) with vetted providers who can deliver that help. The platform supports multiple games and service types, safe checkout, order tracking, chat, and fair payouts to providers.

---

## 1) Roles at a Glance

- Customer: Buys a game service, pays securely, tracks progress, and picks preferred providers when multiple apply (based on completed games and reviews).
- Provider: Applies to orders, delivers the service, communicates via chat, and gets paid. A wallet and earnings page are available in the dashboard. (Providers can apply only after an admin activates their account.)
- Admin: Oversees the marketplace. Manages the catalog (add/edit/delete game → service → subpackage), verifies/activates providers, monitors orders, verifies completed assignments (releasing provider earnings), handles payouts (platform keeps a 20% fee; the rest is split among providers), and invites new admins by email.

---

## 2) Customer Experience

### 2.1 Discover and Purchase

- Browse games and services (e.g., coaching packages, number of games or teammates, or ELO-based tiers if applicable).
- Configure the order details: number of games/teammates, notes for the team, etc.
- Pay securely (Stripe or PayPal depending on configuration). Once paid, an order is created and enters the queue.

### 2.2 Building Your Team

- After payment, your order appears as “Pending” and is visible to providers who can apply.
- You’ll see applicants (provider cards) with their profile, experience, and rating.
- You can accept or decline applicants until you reach the required team size (for example, needing 2 providers). Declining is limited by reroll count.
- A progress indicator shows how close you are to a full team.

### 2.3 Communication & Tracking

- Once providers are accepted, your team is “Complete” and the order moves forward.
- You can chat with your team inside the order page (real-time messaging).
- Order status updates (in progress, completed) are visible in your dashboard.
- If there are no current applicants, the page auto-refreshes periodically; you don’t need to reload manually.

### 2.4 Completion & Post-Order

- When the provider(s) complete and the result is verified, the order is marked as completed.
- You may leave reviews and tip for the providers.
- If you cancel, the platform sends a notification to any approved providers so they’re aware of the change.

---

## 3) Provider Experience

### 3.1 Getting Set Up

- Create a provider account (Admin will activate the account, after the activation provider can apply on orders).
- Complete your profile and preferences in the provider dashboard.

### 3.2 Finding Work (Queue)

- “Services”/Queue tab lists live customer orders you can apply for.
- The queue auto-refreshes every few seconds (only the first load shows a skeleton, subsequent refreshes are smooth).
- When new orders appear during refresh, you’ll hear a brief notification and see a small popup that indicates how many were added.
- Click “Apply Now” on any orders that match your interest and availability.

### 3.3 Being Accepted & Working

- If a customer accepts your application, you’ll see the order under your assignments.
- Open the order detail to access the chat and specific requirements.
- Deliver the service (coaching, playing together, etc.). Provide any requested proof(screenshot after completion).

### 3.4 Completing & Earnings

- When you complete the work and it’s verified (by Admin), your earnings are deposited to your in-platform wallet.
- Your wallet and latest transactions are available in the provider dashboard (earnings tab). Amounts are displayed with clear two-decimal formatting.
- You can request withdrawals as per platform policy (handled via the Admin payouts process, admin will accept payouts to approve money transfer to the provider account).

### 3.5 Notifications

- You may receive notifications (with sound) for key events, even outside the order page (e.g., cancellation).
- The queue and overview sections gently refresh so you see new orders without manual reloads.

---

## 4) Admin Experience

### 4.1 Admin Dashboard Overview

- A left-hand menu provides access to key areas:
  - Dashboard/Home
  - Orders
  - Games / Services / Subpackages (catalog)
  - Customers / Providers
  - Payout Requests
  - Invites (invite new admins)

### 4.2 Managing Orders & Operations

- See live and historical orders across the platform.
- When providers complete, Admin can “verify” the work. This credits the provider’s wallet with the correct amount and logs a transaction (descriptions are normalized to show proper amount, e.g., $5.70).

### 4.3 Catalog Management

- Set up games and services (e.g., “Coaching: Game X”).
- Create subpackages (pricing, number of required providers, ELO-based pricing where relevant).
- Update descriptions and images.

### 4.4 Providers & Customers

- Review provider profiles; adjust status if necessary.
- See customer overviews and manage any escalations.

### 4.5 Payouts (Optional)

- Process provider payout requests where enabled.
- Track payout transactions and statuses.

### 4.6 Inviting New Admins (Email-Based)

- Create an admin invite by entering an email address in the Admin > Invites page.
- The system generates a one-time link and sends an email. The link also shows in the UI for copy.
- The invite expires after a set period and is invalidated after use.
- The invited user completes a short registration (or updates their existing account) and is then redirected to the admin panel.

---

## 5) End-to-End Flows (Step-by-Step)

### 5.1 Customer Buys a Service

1. Customer browses services and selects game/service/package.
2. Chooses specifics (e.g., number of games or teammates, rank/target, optional notes).
3. Pays and sees an order created.
4. Waits for provider applications; accepts until the required team size is reached.
5. Uses chat to coordinate.
6. Order is completed → customer can leave feedback and tip by clicking the review button next to each assignment.

### 5.2 Provider Fulfills an Order

1. Provider checks the Services/Queue tab for available orders.
2. Applies to an order.
3. If accepted by the customer, provider joins the order, check orders page for approved applications and visit chat page.
4. Delivers service and provides proof when appropriate.
5. Admin verifies completion → provider wallet is credited.
6. Provider can request payout per policy.

### 5.3 Admin Verifies and Pays

1. Admin reviews completed work.
2. Verifies assignment → deposits earnings to provider wallet; logs a transaction with clear 2-decimal currency format.
3. Payout requests are processed by the admin.

### 5.4 Admin Invites Another Admin

1. Admin opens “Invites” in the admin panel.
2. Enters the email; system creates an invite link (and sends email if SMTP is configured).
3. Invitee opens the link and sets/updates username/password.
4. On submission, they are made admin and redirected to the admin dashboard.

---

## 6) Real-Time & Refresh Behavior (What to Expect)

- The queue and overview pages automatically refresh every few seconds. The first load shows a brief skeleton; subsequent refreshes are subtle.
- When new orders appear during refresh, providers hear a short notification and see a small popup.
- System notifications (like order cancellation) can appear even outside the order page and play a sound.
- Chat within an order updates in real time.

---

## 7) Cancellations, Rerolls, and Team Size

- Customers can cancel; approved providers receive a brief notification so they’re not left waiting.
- Customers have a limited number of rerolls (declines) for applicants to help them find the best fit.
- Each order has a “required providers” count; once that many are accepted, the team is complete and work starts.

---

## 8) Password Resets & Login

- Forgot password: enter email to receive a reset link.
- Reset page handles verifying the token and setting a new password. On success, you’ll be redirected to login.
- Admins can also be invited via email with a one-time link (see Admin section above).

---

## 9) Safety, Privacy, and Fair Play (Non-Technical)

- Payments are handled by well-known processors (no card details are stored by Diffed.gg itself).
- Chats are private to the order participants and are meant for coordination.
- Providers are expected to uphold fair-play standards and follow the platform’s code of conduct.

---

## 10) Onboarding Checklists

### For Customers

- [ ] Create an account
- [ ] Choose a game/service and configure order details
- [ ] Complete payment
- [ ] Accept providers and communicate via chat
- [ ] Confirm completion and leave feedback and tip

### For Providers

- [ ] Create account and complete profile, visit back when admin approves-->reditrect to dashboard.
- [ ] Check queue often (auto-refresh enabled)
- [ ] Apply to suitable orders
- [ ] Deliver service; communicate in chat
- [ ] Upload screenshot as proof of completion
- [ ] Confirm completion; check wallet and request payouts if needed

### For Admins

- [ ] Log in (or accept admin invite)
- [ ] Manage games/services/subpackages
- [ ] Monitor orders and provider performance
- [ ] Verify completed work, trigger provider payouts
- [ ] Invite additional admins when needed

---

## 11) Frequently Asked Questions (Plain English)

**Q: How do customers get matched with providers?**
Providers see new orders in a live queue and apply. Customers choose from applicants until they have a full team.

**Q: How do providers get paid?**
Once work is verified, earnings are deposited into the provider’s wallet (visible in the provider dashboard). Payouts follow the platform’s policy.

**Q: Can admins invite other admins?**
Yes. Admins can send an email invite that creates a one-time link. The invitee sets/updates credentials and becomes an admin immediately.

**Q: Does the page auto-refresh?**
Yes. Queue and overview sections refresh every few seconds without interrupting your work. The first load shows a brief skeleton; after that it’s seamless.

---

## 12) Final Notes for Stakeholders

- Diffed.gg is designed to be simple and fast for all roles: customers, providers, and admins.
- The platform emphasizes clarity (live queue, progress cards, simple chat), real-time awareness (notifications), and fairness (verification before payouts).
