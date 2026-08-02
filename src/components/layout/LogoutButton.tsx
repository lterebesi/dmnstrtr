import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost">
        Deconectare
      </Button>
    </form>
  );
}
