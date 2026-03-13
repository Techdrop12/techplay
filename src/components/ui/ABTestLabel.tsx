interface ABTestLabelProps {
  variant: string;
}

export default function ABTestLabel({ variant }: ABTestLabelProps) {
  return (
    <span className="text-xs font-semibold text-gray-500">
      Test A/B : {variant}
    </span>
  );
}
