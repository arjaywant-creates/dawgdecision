interface FormProps {
  children: React.ReactNode;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;
}

export default function Form({
  children,
  onSubmit,
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {children}
    </form>
  );
}