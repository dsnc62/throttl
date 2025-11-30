export default function StatCard(props: {
	title: string;
	value: string | number;
}) {
	return (
		<div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
			<span className="text-muted-foreground">{props.title}</span>
			<span className="font-medium text-xl">{props.value}</span>
		</div>
	);
}
