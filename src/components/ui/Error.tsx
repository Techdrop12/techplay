interface ErrorProps {
  message: React.ReactNode;
}

export default function Error({ message }: ErrorProps) {
  return <div className="error">Erreur : {message}</div>;
}
