# Flamingo Bean App

Flamingo Bean is a production-oriented mobile ordering system for a real coffee business. The goal is to support customer ordering from a React Native mobile app, backed by a Python API and a MySQL database.

## Planned Architecture

- `mobile/`: Expo and React Native app written in TypeScript. This will contain the customer ordering experience, menu browsing, cart flow, and order status screens.
- `backend/`: FastAPI service responsible for API routes, business logic, database access, and future integrations.
- `backend/app/models/`: Database models.
- `backend/app/routes/`: HTTP route modules.
- `backend/app/schemas/`: Pydantic request and response schemas.
- `backend/app/services/`: Business logic and integration code.
- MySQL: Primary database for menu items, orders, and order item snapshots.
- Square API: Planned future payment integration. No Square functionality is included yet.
- Admin dashboard: Planned for a later phase and not included in this initial scaffold.

## Current Status

This repository currently contains the mobile ordering shell, product browsing, local cart flow, mock checkout flow, and a FastAPI backend with MySQL-backed products and orders.
