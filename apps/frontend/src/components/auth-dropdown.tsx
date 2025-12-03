import { Link, useLocation } from "@tanstack/react-router";
import {
	LogOutIcon,
	ShieldIcon,
	ShoppingBagIcon,
	UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function AuthDropdown() {
	const { data } = authClient.useSession();
	const location = useLocation();

	const initials = useMemo(() => {
		if (!data) return "??";

		const split = data.user.name.split(" ");
		if (split.length === 0) {
			return "??";
		}

		if (split.length > 1) {
			return split[0][0].toUpperCase() + split[1][0].toUpperCase();
		}

		if (split[0].length > 1) {
			return split[0].slice(0, 2).toUpperCase();
		}

		return split[0][0].toUpperCase();
	}, [data]);

	if (!data) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size="icon-lg" variant="outline">
						<UserIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuItem asChild>
						<Link search={{ callbackURL: location.pathname }} to="/sign-in">
							Sign in
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link search={{ callbackURL: location.pathname }} to="/sign-up">
							Sign up
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon-lg" variant="outline">
					<Avatar className="rounded-sm bg-primary-foreground">
						<AvatarFallback className="bg-primary-foreground text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>{data.user.name}</DropdownMenuLabel>
				<DropdownMenuLabel className="-mt-3 font-normal text-muted-foreground text-xs">
					{data.user.email}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/profile">
						<UserIcon />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/profile/orders">
						<ShoppingBagIcon />
						Orders
					</Link>
				</DropdownMenuItem>

				{data.user.role === "admin" && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuLabel>Admin</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Link to="/admin">
								<ShieldIcon />
								Admin Panel
							</Link>
						</DropdownMenuItem>
					</>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async () => {
						const { error } = await authClient.signOut();
						if (!error) {
							toast("Signed out");
						} else {
							console.error(error);
						}
					}}
				>
					<LogOutIcon /> Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
