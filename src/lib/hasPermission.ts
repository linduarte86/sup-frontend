// Função para verificar se o usuário tem a permissão necessária para acessar um menu ou submenu

export function hasPermission(
  user: any,
  permission?: string
) {

  // menu sem permissão
  if (!permission) {
    return true;
  }

  // admin acesso total
  if (user?.nivel === 'ADMIN') {
    return true;
  }

  // operador
  return user?.permissions?.includes(permission);
}