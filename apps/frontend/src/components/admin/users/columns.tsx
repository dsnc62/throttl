import type { ColumnDef } from "@tanstack/react-table";
import type { FullUser } from "@/lib/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const columns: ColumnDef<FullUser>[] = [
	{
		accessorKey: "name",
		header: "Full Name",
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "address",
		cell: ({ row }) => {
			const user = row.original;

			if (!user.address) {
				return <div>N/A</div>;
			}

			return (
				<div>
					{user.address}, {user.city ?? "UNKNOWN"}, {user.province ?? "??"}{" "}
					{user.postalCode ?? "??? ???"}
				</div>
			);
		},
		header: "Address",
	},
	{
		accessorKey: "cardNumber",
		cell: ({ row }) => {
			const user = row.original;
			const num = user.cardNumber;
			if (!num) {
				return <div>N/A</div>;
			}

			const expMonth = user.cardExpMonth?.toString().padStart(2, "0") ?? "?";
			const expYear = user.cardExpYear ?? "?";

			return (
				<div>
					{num.slice(-4)} (exp. {expMonth}/{expYear})
				</div>
			);
		},
		header: "Card",
	},
	{
		cell: ({ row }) => {
			const user = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="ml-auto flex h-8 w-8 p-0" variant="ghost">
							<MoreHorizontalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(user.id)}
						>
							Copy User ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link search={{ id: user.id }} to="/admin/users/info">
								View User
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		id: "actions",
	},
];
