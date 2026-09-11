export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * O backend responde erros de negócio com o handler padrão do Spring Boot, que não
 * inclui a mensagem original. Traduzimos o status para algo legível ao usuário.
 */
const fallbackMessages: Record<number, string> = {
  400: 'Dados inválidos. Revise as informações e tente de novo.',
  401: 'Sua sessão expirou. Entre novamente para continuar.',
  403: 'Você não tem permissão para executar esta ação.',
  404: 'Registro não encontrado.',
  409: 'Já existe uma reserva para esta quadra no horário escolhido.',
  500: 'Não foi possível concluir a operação. Verifique os dados e tente de novo.',
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Enviado no header X-User-Id, exigido pelos endpoints administrativos. */
  userId?: number
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json()
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message
  } catch {
    /* resposta sem corpo JSON */
  }

  return fallbackMessages[response.status] ?? `Falha na requisição (HTTP ${response.status}).`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, userId } = options
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (userId !== undefined) headers['X-User-Id'] = String(userId)

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível falar com o servidor. Verifique se a API está no ar.')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
