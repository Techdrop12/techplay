declare module 'sib-api-v3-sdk' {
  const _ApiClient: { instance: { authentications: Record<string, { apiKey: string }> } };
  const _TransactionalEmailsApi: new () => {
    sendTransacEmail: (email: unknown) => Promise<{ messageId?: string }>;
  };
  const _SendSmtpEmail: new (opts: Record<string, unknown>) => unknown;
  const api: {
    ApiClient: typeof _ApiClient;
    TransactionalEmailsApi: typeof _TransactionalEmailsApi;
    SendSmtpEmail: typeof _SendSmtpEmail;
  };
  export default api;
}
