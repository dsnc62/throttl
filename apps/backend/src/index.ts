import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "@/lib/auth";
import accessories from "@/routes/accessories";
import cars from "@/routes/cars";
import cart from "@/routes/cart";

const app = new Hono();

app.use(
	"/api/*",
	cors({
		allowHeaders: [
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Credentials",
			"Content-Type",
		],
		allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		origin: "*",
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
