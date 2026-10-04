import { Card } from "@heroui/react";

import NextLink from "next/link";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  href?: string;
}

export default function StatCard({ title, value, href }: StatCardProps) {
  const content = (
    <Card
      className={`p-6 min-w-0 flex flex-col transition-colors ${href ? "hover:border-primary/50" : ""}`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-medium text-default-600">{title}</p>
        {href && (
          <ArrowRight className="size-4 text-default-400 shrink-0 mt-0.5" />
        )}
      </div>
      <h2 className="mt-2 text-3xl font-bold text-foreground truncate">
        {value}
      </h2>
    </Card>
  );

  if (href) {
    return (
      <NextLink className="block w-full" href={href}>
        {content}
      </NextLink>
    );
  }

  return content;
}
