export default function GradientText({ children }) {
  return (
    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
      {children}
    </span>
  );
}
