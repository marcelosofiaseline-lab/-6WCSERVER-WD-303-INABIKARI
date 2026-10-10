# Inabikari - Japanese & Chinese Kitchen (MEVN)

MongoDB + Express + Vue 3 + Node. Pages: Home, Menu, Reserve, Order (cart + tracking), Admin.

## Setup (Node 20.19+ and MongoDB running locally)
1. Copy your old `package-lock.json` next to `package.json` (server dependencies are unchanged), then `npm install`
2. `npm run seed`      (adds starter menu items to dbRestaurants.menu)
3. `npm run build`     (installs client deps and builds the Vue app)
4. `npm start`         -> http://localhost:3000

## Development (two terminals)
- `npm start`          (API on :3000)
- `npm run client`     (Vue dev server on :5173, proxies /api to :3000)

Staff login on /admin uses the ADMIN_KEY environment variable (default `inabikari-admin`; change it).
Collections in `dbRestaurants`: `menu`, `reservations`, `orders`.
