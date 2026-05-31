import { cn } from "@/lib/utils";

const SkeletonsLoader = ({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) => {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {[...Array(count)].map((_, i) => (
        <li key={i} className="h-16 rounded-md bg-gray-100 animate-pulse" />
      ))}
    </ul>
  );
};

export default SkeletonsLoader;
