"use client";

import * as SelectPrimitive from "@radix-ui/react-select";

export function Select({ children, ...props }) {
  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger className="border p-2 rounded-md w-full">
        <SelectPrimitive.Value />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="bg-white border shadow-md p-2 rounded-md">
          {children}
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function SelectTrigger({ children }) {
  return <SelectPrimitive.Trigger>{children}</SelectPrimitive.Trigger>;
}

export function SelectValue() {
  return <SelectPrimitive.Value />;
}

export function SelectContent({ children }) {
  return <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>;
}

export function SelectItem({ children, ...props }) {
  return (
    <SelectPrimitive.Item
      {...props}
      className="p-2 hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </SelectPrimitive.Item>
  );
}
