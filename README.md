# Scalable E-Commerce Platform

A microservices demo store: several small **Node.js** services behind an **API Gateway**, with a **React (Vite)** storefront. Users browse a product catalog, manage a cart, place orders, pay (mock Stripe/PayPal), and receive notifications. Services talk over REST and async **RabbitMQ** events, register themselves in **Consul**, and store data in **PostgreSQL** and **Redis**.

---

## What you can do

| Role | Capabilities |
|------|----------------|
| **Guest** | Browse the product catalog and product details, sign up, log in |
| **User** | Everything a guest can do, plus manage a cart, check out (Stripe card or PayPal — mocked), view order history and order details, and read the notifications inbox |
| **System** | Sends automatic email/SMS (mocked) on order placed, payment completed, and shipping updates via RabbitMQ events |

---

## Services at a glance

| Service | Port | Responsibility |
|---------|------|----------------|
| API Gateway | 8080 | Single entry point, JWT checks, routing, Consul discovery |
| User Service | 3001 | Registration, login (JWT), profiles |
| Product Service | 3002 | Products, categories, inventory |
| Cart Service | 3003 | Redis-backed shopping carts |
| Order Service | 3004 | Order placement, status, history |
| Payment Service | 3005 | Stripe / PayPal payments (mock by default) |
| Notification Service | 3006 | Email (SendGrid) & SMS (Twilio) — mock by default |

Supporting infrastructure: **PostgreSQL** (per-service databases), **Redis** (cart), **RabbitMQ** (events), **Consul** (service discovery), and optional **Prometheus/Grafana** and **ELK** for monitoring and logs.

---

## Prerequisites

- **Docker** and Docker Compose v2 (runs the whole backend and infrastructure)
- **Node.js 20+** and npm (only needed for local frontend development)

---

## 1. Configure environment

From the repository root:

```bash
cp .env.example .env
```

The defaults work out of the box. Payments and notifications run in **mock mode** unless you add real API keys. Adjust secrets (`JWT_SECRET`, `POSTGRES_PASSWORD`, `RABBITMQ_PASSWORD`) before any real deployment.

---

## 2. Run it

There are two ways to run the project. Pick one.

### Option A — Two terminals (recommended for development)

Backend in Docker, frontend with Vite hot reload — same workflow as the movie reservation project.

**Terminal 1 — backend** (gateway + services + infrastructure; logs stream here):

```bash
make dev-backend
```

Wait until the services report healthy. The API is at [http://localhost:8080](http://localhost:8080).

**Terminal 2 — frontend** (Vite dev server):

```bash
make dev-frontend
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to `http://localhost:8080`.

Stop the backend with `Ctrl+C` in Terminal 1, then `make down` to remove the containers.

### Option B — All in Docker

Runs everything, including the storefront, in one command:

```bash
make up
# or: docker compose up -d --build
```

Give it ~60 seconds to become healthy, then open:

- Storefront: [http://localhost:5173](http://localhost:5173)
- API Gateway: [http://localhost:8080](http://localhost:8080)

Quick check:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/products
```

---

## 3. Smoke test (optional)

Registers a user, adds a product to the cart, places an order, pays, and checks notifications end to end:

```bash
make smoke
```

---

## Handy URLs

| Tool | URL | Credentials |
|------|-----|-------------|
| Storefront | http://localhost:5173 | — |
| API Gateway | http://localhost:8080 | — |
| Consul UI | http://localhost:8500 | — |
| RabbitMQ | http://localhost:15672 | `ecommerce` / `ecommerce_secret` |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | `admin` / `admin` |
| PostgreSQL (host) | localhost:**5433** | `ecommerce` / `ecommerce_secret` |

> Postgres uses host port **5433** to avoid clashing with a local Postgres on 5432.

Enable centralized logging (ELK) if you want it:

```bash
make logging   # Kibana: http://localhost:5601
```

---

## Typical usage flow

1. **Start** the backend and frontend (Option A or B above).
2. **Sign up** or log in from the storefront.
3. **Browse** the catalog, open a product, and **add it to your cart**.
4. **Check out** — enter shipping details, then pick Stripe (card) or PayPal (email). Payments are mocked by default.
5. **Order history / detail** — track status, view payment info, and (demo) mark a paid order as shipped to trigger shipping notifications.
6. **Notifications** — open the inbox in the nav to see the email/SMS the system generated.

---

## Project layout (high level)

| Path | Role |
|------|------|
| `docker-compose.yml` | Orchestrates all services and infrastructure |
| `Makefile` | `up`, `down`, `dev-backend`, `dev-frontend`, `smoke`, `logging` |
| `gateway/api-gateway/` | API Gateway (routing, auth, discovery) |
| `services/` | The six microservices (user, product, cart, order, payment, notification) |
| `shared/` | Shared logging, Consul, metrics, and messaging helpers |
| `frontend/` | React + TypeScript storefront (Vite) |
| `infrastructure/` | Postgres init, Prometheus, Grafana, ELK config |
| `scripts/smoke-test.sh` | End-to-end smoke test |
| `.github/workflows/ci.yml` | CI: lint, build images, run smoke tests |

---

## Troubleshooting

- **`Request failed (500)` in the storefront** — the frontend is up but the backend isn't. Make sure `make dev-backend` (or `make up`) is running and the gateway responds at [http://localhost:8080/health](http://localhost:8080/health). The Vite proxy returns 500 when it can't reach the gateway.
- **A service won't start / Consul unhealthy** — the registry is ephemeral by design, so `make down` then start again for a clean boot.
- **Port already in use** — check nothing else is on `8080`, `5173`, `5433`, `8500`, `15672`, `9090`, or `3000`.
- **Catalog looks empty or stale** — the product database seeds only when its table is empty. To reload seed data, reset the Postgres volume (this wipes all service data): `docker compose down -v` then start again.

---

## Going live (notes)

Payments and notifications ship in mock mode. To use real providers, set the matching `*_MOCK=false` flags and add credentials in `.env` (see `.env.example`): Stripe, PayPal, SendGrid, and Twilio. Never commit `.env`.

---

## License

MIT
