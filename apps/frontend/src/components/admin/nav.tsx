import { Link, useLocation } from "@tanstack/react-router";
import AuthDropdown from "../auth-dropdown";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";

export function AdminNav() {
	const location = useLocation();

	return (
		<header className="sticky top-0 left-0 z-30 flex w-screen p-2">
			<div className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar/90 p-1 shadow backdrop-blur-sm backdrop-brightness-150">
				<section>
					<Button asChild className="group bg-transparent hover:bg-primary">
						<Link to="/">
							<span className="bg-linear-to-r from-primary to-amber-500 bg-clip-text font-display font-extrabold text-base text-transparent italic transition-all group-hover:bg-transparent group-hover:text-primary-foreground">
								throttl.
							</span>
						</Link>
					</Button>
				</section>

				<nav className="flex flex-1 gap-1">
					<Button
						asChild
						variant={location.pathname === "/shop" ? "secondary" : "ghost"}
					>
						<Link to="/shop">Shop</Link>
					</Button>
				</nav>

				<section className="flex flex-1 items-center justify-end gap-2">
					<ThemeToggle />
					<AuthDropdown />
				</section>
			</div>
		</header>
	);
}
