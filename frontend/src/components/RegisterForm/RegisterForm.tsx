import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Anchor, Button, Checkbox, PasswordInput, Stack, Text, TextInput, ThemeIcon, Title } from '@mantine/core'
import { ArrowIcon, CheckIcon, LockIcon, MailIcon, UserIcon } from '../Icons'
import { ApiError, register } from '../../api'
import './RegisterForm.css'

type RegisterFormProps = {
  onShowLogin: () => void
}

export function RegisterForm({ onShowLogin }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register(name.trim(), email.trim(), password)
      setSubmitted(true)
    } catch (caught) {
      const offline = caught instanceof ApiError && caught.status === 0
      setError(offline ? caught.message : 'Não foi possível criar a conta. Talvez este e-mail já esteja cadastrado.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="success-state" role="status">
        <ThemeIcon size={62} radius="xl" color="green" variant="light"><CheckIcon size={30} /></ThemeIcon>
        <Title order={3}>Conta criada!</Title>
        <Text c="dimmed" ta="center">Agora é só entrar e escolher a melhor quadra e horário para você.</Text>
        <Button color="gold" fullWidth onClick={onShowLogin}>Ir para o login</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        {error && <Alert color="red" variant="light" role="alert">{error}</Alert>}

        <TextInput
          label="Nome completo"
          placeholder="Como devemos chamar você?"
          required
          autoComplete="name"
          leftSection={<UserIcon />}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <TextInput
          label="E-mail"
          placeholder="seu@email.com"
          type="email"
          required
          autoComplete="email"
          leftSection={<MailIcon />}
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />
        <PasswordInput
          label="Senha"
          description="Use pelo menos 8 caracteres"
          placeholder="Crie uma senha segura"
          minLength={8}
          required
          autoComplete="new-password"
          leftSection={<LockIcon />}
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />
        <Checkbox
          required
          color="gold"
          mt={4}
          label={<Text span size="sm" c="dimmed">Li e aceito os <Anchor href="#" fw={600} c="brand.8">Termos de Uso</Anchor> e a <Anchor href="#" fw={600} c="brand.8">Política de Privacidade</Anchor>.</Text>}
        />
        <Button type="submit" fullWidth size="md" color="gold" rightSection={<ArrowIcon />} mt="xs" loading={loading}>
          Criar minha conta
        </Button>
      </Stack>

      <Text ta="center" size="sm" c="dimmed" mt="xl">
        Já tem uma conta?{' '}
        <Anchor component="button" type="button" fw={700} c="brand.8" onClick={onShowLogin}>Fazer login</Anchor>
      </Text>
    </form>
  )
}
