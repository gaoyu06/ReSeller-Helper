import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm" className="w-full">
        退出登录
      </Button>
    </form>
  );
}
