import { Link } from "@tanstack/react-router";
import { LogInIcon } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function ShopNav() {
	return (
		<header className="sticky top-0 left-0 flex w-screen gap-2 p-2">
			<div className="flex flex-1 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar/90 p-1 shadow backdrop-blur-sm backdrop-brightness-150">
				<section className="flex-1">
					<Button asChild className="group bg-transparent hover:bg-primary">
						<Link to="/">
							<span className="bg-linear-to-r from-primary to-amber-500 bg-clip-text font-display font-extrabold text-base text-transparent italic transition-all group-hover:bg-transparent group-hover:text-primary-foreground">
								throttl.
							</span>
						</Link>
					</Button>
				</section>

				<nav className="flex gap-2"></nav>

				<section className="flex gap-2">
					<ThemeToggle />
					<Button size="icon-lg" variant="outline">
						<LogInIcon />
					</Button>
				</section>
			</div>
		</header>
	);
}
