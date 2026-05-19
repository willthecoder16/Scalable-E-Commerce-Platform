#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "==> Health check"
curl -sf "$BASE_URL/health" | head -c 200
echo ""

echo "==> List products"
PRODUCTS=$(curl -sf "$BASE_URL/api/products")
echo "$PRODUCTS" | head -c 300
echo ""

PRODUCT_ID=$(echo "$PRODUCTS" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>console.log(JSON.parse(d).products[0].id));
")

echo "==> Register user"
REGISTER=$(curl -sf -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@shop.com","password":"demo12345","firstName":"Demo","phone":"+15551234567"}')
TOKEN=$(echo "$REGISTER" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")
USER_ID=$(echo "$REGISTER" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).user.id))")
echo "User: $USER_ID"

echo "==> Add to cart"
curl -sf -X POST "$BASE_URL/api/cart/$USER_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"name\":\"Test Product\",\"price\":49.99,\"quantity\":2}" > /dev/null

echo "==> Place order"
ORDER=$(curl -sf -X POST "$BASE_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"email\":\"demo@shop.com\",\"phone\":\"+15551234567\",\"shippingAddress\":{\"street\":\"123 Main St\",\"city\":\"NYC\",\"zip\":\"10001\"}}")
ORDER_ID=$(echo "$ORDER" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).order.id))")
TOTAL=$(echo "$ORDER" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).order.total))")
echo "Order: $ORDER_ID (total: $TOTAL)"

echo "==> Process payment"
curl -sf -X POST "$BASE_URL/api/payments/process" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\",\"userId\":\"$USER_ID\",\"amount\":$TOTAL,\"provider\":\"stripe\"}" > /dev/null

sleep 2

echo "==> Check notifications"
curl -sf "$BASE_URL/api/notifications" -H "Authorization: Bearer $TOKEN" | head -c 400
echo ""

echo "==> All smoke tests passed"
