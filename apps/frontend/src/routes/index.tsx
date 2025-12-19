import { createFileRoute, Link } from "@tanstack/react-router";
import { CarIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const KEYS = Array.from(Array(22).keys());

function Home() {
	const session = authClient.useSession();
	useEffect(() => {
		fetch(env.VITE_BACKEND_URL).then(async (res) =>
			console.warn(await res.text()),
		);
	}, []);

	return (
		<main className="flex h-dvh w-screen select-none flex-col items-center justify-between overflow-hidden">
			<header>
				<InfiniteSlider
					className="w-screen"
					gap={24}
					speed={80}
					speedOnHover={62}
				>
					{KEYS.map((v) => (
						<CarIcon
							className={cn(
								"size-11 rotate-y-180",
								v % 2 === 0
									? "text-red-500"
									: "text-rose-700 dark:text-rose-300",
							)}
							key={`header-car-${v}`}
						/>
					))}
				</InfiniteSlider>
			</header>
			<section className="flex flex-col items-center">
				<div className="mb-2 flex gap-6">
					<h1 className="bg-linear-to-r from-primary to-amber-500 bg-clip-text font-display font-extrabold text-6xl text-transparent italic md:text-8xl">
						throttl.
					</h1>
					<CarIcon className="size-15 text-amber-500 md:size-24" />
				</div>
				<p className="mb-6 text-lg md:text-2xl">
					Your one-stop shop for all things car.
				</p>
				<div className="flex gap-2">
					<Button asChild className="group" size="lg">
						<Link to="/shop">
							Browse
							<ChevronRightIcon className="-mr-2 right-4 size-0 transition-all group-hover:mr-0 group-hover:size-4 group-hover:scale-100" />
						</Link>
					</Button>
					{!session.data && (
						<Button asChild className="group" size="lg" variant="secondary">
							<Link to="/sign-up">
								Sign Up
								<ChevronRightIcon className="-mr-2 right-4 size-0 transition-all group-hover:mr-0 group-hover:size-4 group-hover:scale-100" />
							</Link>
						</Button>
					)}
				</div>
			</section>
			<footer>
				<InfiniteSlider
					className="w-screen"
					gap={24}
					reverse
					speed={110}
					speedOnHover={97}
				>
					{KEYS.map((v) => (
						<CarIcon
							className={cn(
								"size-11",
								v % 2 === 0
									? "text-emerald-500"
									: "text-teal-700 dark:text-teal-300",
							)}
							key={`footer-car-${v}`}
						/>
					))}
				</InfiniteSlider>
			</footer>
		</main>
	);
}
