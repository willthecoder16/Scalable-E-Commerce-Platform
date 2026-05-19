.PHONY: up down build logs smoke test logging dev dev-backend dev-frontend frontend-dev

# ─── One-shot (everything in Docker, detached) ───────────────────────────────
up:
	docker compose up -d --build

# ─── Two-terminal dev (like movie reservation project) ───────────────────────
# Terminal 1: make dev-backend
# Terminal 2: make dev-frontend
dev-backend:
	docker compose up --build \
		postgres redis rabbitmq consul \
		user-service product-service cart-service \
		order-service payment-service notification-service \
		api-gateway

dev-frontend:
	cd frontend && npm install && npm run dev

dev: dev-backend

# alias
frontend-dev: dev-frontend

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f api-gateway

smoke:
	bash scripts/smoke-test.sh

test: smoke

logging:
	docker compose --profile logging up -d elasticsearch logstash kibana
