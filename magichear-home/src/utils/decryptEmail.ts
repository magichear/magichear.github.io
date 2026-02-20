/** 解密 Base64 编码的邮箱地址并打开邮件客户端 */
export function decryptEmail(encoded: string): void {
  const address = atob(encoded);
  window.location.href = "mailto:" + address;
}
