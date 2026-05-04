import HeaderClient from "./HeaderClient";
import { cookies } from "next/headers";

export default async function Header() {

  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}/me`, {
    method: 'GET',
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return <HeaderClient username="Usuário" />;
  }

  const user = await response.json();

  return (
    <HeaderClient username={user.name} />
  );
}