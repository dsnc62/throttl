import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.js";
import accessories from "./routes/accessories.js";
import cars from "./routes/cars.js";
import cart from "./routes/cart.js";
import order from "./routes/orders.js";

const app = new Hono();

const origin = ["http://localhost:3000", "https://throttl.vercel.app"];

app.use(logger());

app.use(
	"/api/auth/*",
	cors({
		allowHeaders: [
			"Authorization",
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Origin",
			"Content-Type",
		],
		allowMethods: ["POST", "GET", "OPTIONS"],
		credentials: true,
		exposeHeaders: ["Content-Length"],
		maxAge: 6000,
		origin,
	}),
);

app.use(
	"/api/*",
	cors({
		allowHeaders: [
			"Authorization",
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Origin",
			"Content-Type",
		],
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		origin,
	}),
);

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/accessories", accessories);
app.route("/api/cars", cars);
app.route("/api/cart", cart);
app.route("/api/orders", order);

export default {
	fetch: app.fetch,
	port: 8787,
};
