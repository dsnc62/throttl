import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";
import accessories from "@/routes/accessories";
import cars from "@/routes/cars";
import cart from "@/routes/cart";

const app = new Hono();

const origin = process.env.DATABASE_URL.includes("http://")
	? "http://localhost:3000"
	: "*";

app.use(
	"/api/auth/*",
	cors({
		allowHeaders: ["Authorization", "Content-Type"],
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
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Origin",
			"Content-Type",
		],
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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

export default app;
