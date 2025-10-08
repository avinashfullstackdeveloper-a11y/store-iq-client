import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { DateTime } from "luxon";
import { useAuth } from "@/context/AuthContext";
import { Input } from "./ui/input";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (scheduledTime: DateTime) => void;
}

export function ScheduleDialog({ open, onOpenChange, onSchedule }: ScheduleDialogProps) {
  const { user } = useAuth();
  const timezone = user?.timezone || DateTime.local().zoneName;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(DateTime.now().setZone(timezone).toFormat("HH:mm"));

  const handleSchedule = () => {
    if (!date) return;
    
    // Parse the selected time
    const [hours, minutes] = time.split(":").map(Number);
    
    // Create DateTime object with selected date and time in user's timezone
    const scheduledTime = DateTime.fromJSDate(date)
      .setZone(timezone)
      .set({ hour: hours, minute: minutes });

    onSchedule(scheduledTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-[425px]">
        <DialogTitle className="text-xl font-bold">Schedule Post</DialogTitle>
        
        <div className="grid gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date()}
              className="bg-slate-800 text-white border-slate-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Time ({timezone})</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}