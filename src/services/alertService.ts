import socket from './socket';

// Essa função inicializa o listener global do socket
export function initAlertService(onNovaFalha: (falha: any) => void) {
  socket.on('novaFalha', (falha) => {
    console.log('[Service] Nova falha recebida:', falha);
    onNovaFalha(falha);
  });
}
