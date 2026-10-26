import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  durationMinutes: number;
  startTime: Date | number | string;
  onExpire: () => void;
}

function getDeadline(durationMinutes: number, startTime: Date | number | string) {
  const startTimestamp =
    startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime();

  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) {
    throw new RangeError("durationMinutes must be a non-negative number.");
  }
  if (!Number.isFinite(startTimestamp)) {
    throw new RangeError("startTime must be a valid date or timestamp.");
  }

  return startTimestamp + durationMinutes * 60_000;
}

function formatRemainingTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`
    : `${paddedMinutes}:${paddedSeconds}`;
}

export function CountdownTimer({
  durationMinutes,
  startTime,
  onExpire,
}: CountdownTimerProps) {
  const deadline = getDeadline(durationMinutes, startTime);
  const [now, setNow] = useState(() => Date.now());
  const onExpireRef = useRef(onExpire);
  const notifiedDeadlineRef = useRef<number | null>(null);
  const remainingSeconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  const isExpired = remainingSeconds === 0;
  const formattedTime = formatRemainingTime(remainingSeconds);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isExpired && notifiedDeadlineRef.current !== deadline) {
      notifiedDeadlineRef.current = deadline;
      onExpireRef.current();
    }
  }, [deadline, isExpired]);

  return (
    <div
      className={`countdown-timer${isExpired ? " countdown-timer-expired" : ""}`}
      role="timer"
      aria-label={
        isExpired ? "Time expired" : `Time remaining: ${formattedTime}`
      }
    >
      <span className="countdown-timer-label">
        {isExpired ? "Time expired" : "Time remaining"}
      </span>
      <strong className="countdown-timer-value">
        {isExpired ? "00:00" : formattedTime}
      </strong>
    </div>
  );
}
