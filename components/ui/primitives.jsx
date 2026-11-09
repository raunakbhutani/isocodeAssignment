import * as TabsPrimitive from "@radix-ui/react-tabs";

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[var(--ink)] text-white hover:bg-[var(--accent)]",
    secondary: "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--ink)]",
    ghost: "text-[var(--ink)] hover:bg-[#f3f3f0]",
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`border border-[var(--line)] bg-white ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    success: "bg-emerald-50 text-emerald-800",
    warning: "bg-amber-50 text-amber-900",
    accent: "bg-[#f6e9e4] text-[var(--accent)]",
  };

  return <span className={`inline-flex w-fit items-center px-2.5 py-1 text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ children, className = "", ...props }) => (
  <TabsPrimitive.List className={`flex border-b border-[var(--line)] ${className}`} {...props}>
    {children}
  </TabsPrimitive.List>
);
export const TabsTrigger = ({ children, className = "", ...props }) => (
  <TabsPrimitive.Trigger
    className={`relative px-4 py-4 text-sm text-[var(--muted)] outline-none transition-colors hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] data-[state=active]:font-medium data-[state=active]:text-[var(--ink)] after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-transparent data-[state=active]:after:bg-[var(--accent)] ${className}`}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
);
export const TabsContent = ({ children, className = "", ...props }) => (
  <TabsPrimitive.Content className={`outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`} {...props}>
    {children}
  </TabsPrimitive.Content>
);
