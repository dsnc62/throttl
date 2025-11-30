import { ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
	dateLabel?: string;
	timeLabel?: string;
	value?: Date;
	defaultValue?: Date;
	minDate?: Date;
	maxDate?: Date;
	onChange?: (date: Date | undefined) => void;
}

const combineDateTime = (
	selectedDate: Date | undefined,
	selectedTime: string,
) => {
	if (!selectedDate) return undefined;
	const [hours, minutes, seconds] = selectedTime.split(":").map(Number);
	const combined = new Date(selectedDate);
	combined.setHours(hours, minutes, seconds || 0);
	return combined;
};

const formatTime = (date: Date) => {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	return `${hours}:${minutes}:${seconds}`;
};

export function DateTimePicker({
	dateLabel = "Date",
	timeLabel = "Time",
	onChange,
	...props
}: DateTimePickerProps) {
	const [open, setOpen] = useState(false);
	const [internalDate, setInternalDate] = useState<Date | undefined>(
		props.defaultValue || props.value,
	);
	const [time, setTime] = useState(
		props.defaultValue
			? formatTime(props.defaultValue)
			: props.value
				? formatTime(props.value)
				: "10:30:00",
	);

	useEffect(() => {
		if (props.value !== undefined) {
			setInternalDate(props.value);
			setTime(formatTime(props.value));
		}
	}, [props.value]);

	useEffect(() => {
		const combined = combineDateTime(internalDate, time);
		onChange?.(combined);
	}, [internalDate, time, onChange]);

	return (
		<div className="flex w-full gap-4">
			<div className="flex flex-1 flex-col gap-3">
				<Label
					className="px-1"
					htmlFor={`${dateLabel.toLowerCase().replaceAll(" ", "-")}-picker`}
				>
					{dateLabel}
				</Label>
				<Popover onOpenChange={setOpen} open={open}>
					<PopoverTrigger asChild>
						<Button
							className="w-full justify-between font-normal"
							id={`${dateLabel.toLowerCase().replaceAll(" ", "-")}-picker`}
							variant="outline"
						>
							{internalDate ? internalDate.toLocaleDateString() : "Select date"}
							<ChevronDownIcon />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0">
						<Calendar
							captionLayout="dropdown"
							disabled={(date) =>
								(props.minDate && date < props.minDate) ||
								(props.maxDate && date > props.maxDate) ||
								false
							}
							mode="single"
							onSelect={(date) => {
								setInternalDate(date);
								setOpen(false);
							}}
							selected={internalDate}
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex flex-1 flex-col gap-3">
				<Label
					className="px-1"
					htmlFor={`${timeLabel.toLowerCase().replaceAll(" ", "-")}-picker`}
				>
					{timeLabel}
				</Label>
				<Input
					className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					id={`${timeLabel.toLowerCase().replaceAll(" ", "-")}-picker`}
					onChange={(e) => setTime(e.target.value)}
					step="1"
					type="time"
					value={time}
				/>
			</div>
		</div>
	);
}
