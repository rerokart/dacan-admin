export default function FieldError({ error }: { error?: { message: string } }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-error-500">{error.message}</p>;
}
