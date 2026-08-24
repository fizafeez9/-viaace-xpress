# ViaAce Xpress — Product Requirements (MVP)

## Overview
A React Native / Expo bilingual (BM + EN) delivery-booking mobile app for the Malaysian market. Customers can quickly book a rider (motor) or driver (kereta) to pick up and deliver packages. Design closely follows the yellow/black ViaAce Xpress brand.

## User Choices Gathered
- Features: order rider/driver, live tracking, order history, chat with rider, rating, profile
- Auth: Google Auth + mock guest login (phone OTP marked "coming soon")
- Payment: Card (Stripe) + Touch 'n Go + Cash — collected at checkout (mock settlement for MVP)
- Maps: `react-native-maps` on native (web preview shows fallback graphic)
- Bilingual UI (BM default, EN toggle)

## Implemented Screens
- Splash / auth gate (`/index`)
- Login (`/login`) — Google + Guest
- Bottom tabs: Utama (Home) / Tempahan (Orders) / Bantuan (Help) / Akaun (Account)
- Home / Place Order — full 5-step form matching reference screenshot
- Quote / Payment method (`/order/quote`)
- Live tracking (`/order/tracking/[id]`) with rider info, timeline, cancel
- Chat with rider (`/order/chat/[id]`) with auto rider replies
- Rating (`/order/rate/[id]`)
- Notifications (`/notifications`)
- Menu drawer (`/menu`) — profile shortcut, language, logout

## Backend Endpoints (`/api`)
- `POST /auth/session` — exchange session token
- `POST /auth/mock` — guest login for demo
- `GET /auth/me`, `POST /auth/logout`
- `POST /quote` — computes price by distance / size / vehicle
- `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`
- `GET /orders/{id}/chat`, `POST /orders/{id}/chat`
- `POST /orders/{id}/rate`
- `GET /notifications`

## Order simulation
- On each `GET /orders/{id}` the backend auto-progresses status
  `searching → accepted → picked_up → in_transit → delivered` every ~25s and nudges rider location toward the pickup / destination.

## Tech
- Backend: FastAPI + Motor (MongoDB) + httpx
- Frontend: Expo Router 6, react-native-maps, @gorhom/bottom-sheet, expo-secure-store, expo-image, expo-linear-gradient, @expo/vector-icons

## Non-goals for MVP
- Real Stripe/Touch 'n Go settlement (checkout mocked)
- Phone-OTP login flow
- Rider-facing app
