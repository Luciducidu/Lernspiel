interface TimerEndAlertProps {
  visible: boolean;
}

export function TimerEndAlert({ visible }: TimerEndAlertProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="timer-end-alert" role="status" aria-live="polite">
      <strong>Zeit geschafft</strong>
      <span>Du kannst abschließen oder dir bewusst Extra-Zeit nehmen.</span>
    </div>
  );
}
