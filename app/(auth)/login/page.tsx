import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <Input placeholder="Email" />
      <Input placeholder="Password" type="password" />

      <Button className="w-full">Sign In</Button>
    </div>
  );
}