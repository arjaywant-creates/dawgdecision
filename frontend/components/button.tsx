import { Button as HeroButton } from "@heroui/react";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export default function Button({
  children,
  onPress,
}: ButtonProps) {
  return (
    <HeroButton onPress={onPress}>
      {children}
    </HeroButton>
  );
}