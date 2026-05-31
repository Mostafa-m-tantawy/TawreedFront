"use client";

import { Loader2Icon } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2Icon className="animate-spin" />;
    </div>
  );
};

export default Loader;
