"use client";

import useConversation from "@/app/hooks/useConversation";
import EmptyState from "@/app/components/EmptyState";
import clsx from "clsx";

const Home = () => {
  const { isOpen } = useConversation();

  return (
    <div
      className={clsx("lg:pl-80 h-full lg:block", isOpen ? "block" : "hidden")}
    >
      <EmptyState />
    </div>
  );
};

export default Home;
