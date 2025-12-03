import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function AuthWall(props: { callbackURL: string }) {
	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<div className="rounded-lg bg-background p-6 text-center shadow-lg">
				<h2 className="mb-4 font-display font-medium text-2xl">
					You need to be signed in to continue.
				</h2>
				<Button asChild>
					<Link search={{ callbackURL: props.callbackURL }} to="/sign-in">
						Log In
					</Link>
				</Button>
			</div>
		</div>
	);
}
