# 🏖️ AgendaBeach

Plataforma para agendamento de quadras de **Beach Tennis**. Permite que clientes reservem horários com facilidade e que administradores gerenciem quadras, tarifas e ocupação.

Projeto acadêmico da disciplina de Engenharia de Software — Centro Universitário Católica SC.

---

## 📋 Sumário

- [Equipe](#-equipe)
- [Stack de Tecnologias](#-stack-de-tecnologias)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Estratégia de Branches](#-estratégia-de-branches)
- [Padronização de Commits](#-padronização-de-commits)
- [Fluxo de Trabalho (Workflow)](#-fluxo-de-trabalho-workflow)
- [Guia de Estilo e Padrões de Código](#-guia-de-estilo-e-padrões-de-código)
- [Definition of Ready (DoR)](#-definition-of-ready-dor)
- [Definition of Done (DoD)](#-definition-of-done-dod)
- [Gestão de Débito Técnico](#-gestão-de-débito-técnico)
- [Estratégia de Testes](#-estratégia-de-testes)
- [CI/CD e Qualidade de Código](#-cicd-e-qualidade-de-código)

---

## 👥 Equipe

| Papel | Integrante |
|---|---|
| Product Owner (PO) | Nathalia Aline Berri Silva |
| Engenheira de Requisitos | Nathalia Aline Berri Silva |
| Quality Assurance (QA) | Gabriel Albani De Souza |
| Desenvolvedor Frontend | Murilo Enzo Watanabe |
| Desenvolvedor Backend | Vinícius Henrique Da Silva |
| DevOps | Miguel Augusto Guedes |

---

## 🛠 Stack de Tecnologias

- **Frontend:** React.js
- **Backend:** Java + Spring Boot
- **Banco de Dados:** PostgreSQL
- **Controle de Versão:** GitHub
- **Qualidade de Código:** ESLint, Prettier, SonarQube
- **Documentação de API:** Swagger / OpenAPI
- **Gestão de Backlog:** Jira

---

## 🚀 Como Rodar o Projeto

> ⚠️ Seção a ser preenchida conforme o backend e o frontend forem inicializados.

```bash
# Clonar o repositório
git clone https://github.com/MuriloWatanabe/AgendaBeach.git
cd AgendaBeach

# Backend (Spring Boot)
cd backend
./mvnw spring-boot:run

# Frontend (React)
cd frontend
npm install
npm run dev
```

---

## 🌿 Estratégia de Branches

Adotamos um modelo baseado no **Git Flow simplificado**:

| Branch | Finalidade |
|---|---|
| `main` (ou `master`) | Código **estável e pronto para produção/entrega**. Só recebe merge da `dev` em pontos de release. |
| `dev` | Código em **integração** para a entrega atual. Todas as features são mergeadas aqui primeiro. |
| `feat/<n-tarefa>/<nome-da-funcionalidade>` | Branches de nova funcionalidade. Ex.: `feat/12/cadastro-quadra` |
| `feat/<nome-da-funcionalidade>` | Branches de nova funcionalidade. Ex.: `feat/cadastro-quadra` |
| `fix/<n-tarefa>/<descricao>` | Branches de correção de bug. Ex.: `fix/27/reserva-duplicada` |

### Regras
- **Nunca commitar direto em `main` ou `dev`.** Sempre via Pull Request.
- Toda branch de trabalho parte da `dev` atualizada.
- Após o merge, a branch de feature é deletada.

---

## 📝 Padronização de Commits

Prefixos obrigatórios na mensagem de commit:

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `bug:` | Correção de bug |
| `refactor:` | Alteração/manutenção preventiva (sem mudança de comportamento) |
| `docs:` | Alterações na documentação |

**Exemplos:**
```
feat: adiciona endpoint de cadastro de quadras
bug: corrige cálculo de tarifa em horário de pico
refactor: extrai serviço de validação de reserva
docs: atualiza README com fluxo de branches
```

**Boas práticas:**
- Mensagem no imperativo e em minúsculas após o prefixo.
- Mensagens objetivas (≤ 72 caracteres na primeira linha).
- Um commit = uma mudança lógica.

---

## 🔁 Fluxo de Trabalho (Workflow)

1. **Puxar tarefa do Jira** que atenda ao [DoR](#-definition-of-ready-dor).
2. **Atualizar a `dev` local:**
   ```bash
   git checkout dev
   git pull origin dev
   ```
3. **Criar a branch de trabalho** a partir da `dev`:
   ```bash
   git checkout -b feat/<n-tarefa>/<nome-da-funcionalidade>
   ```
4. **Desenvolver** seguindo o [Guia de Estilo](#-guia-de-estilo-e-padrões-de-código) e commitar seguindo o padrão de commits.
5. **Subir a branch** e abrir Pull Request para a `dev`:
   ```bash
   git push origin feat/<n-tarefa>/<nome-da-funcionalidade>
   ```
6. **Abrir Pull Request** com:
   - Título no padrão do commit (`feat: ...`).
   - Descrição com o número da tarefa no Jira, o que foi feito e como testar.
   - Marcadores de labels (feat, bug, refactor, docs).
7. **Code Review obrigatório** por pelo menos **1 outro dev/QA** antes do merge.
8. **Validação de QA** conforme [DoD](#-definition-of-done-dod).
9. **Merge na `dev`** somente após aprovação, CI verde e sem conflitos.
10. Branch de trabalho **deletada após o merge**.

### Regras de Pull Request
- Nenhum PR é aprovado se houver **erros críticos** no ESLint, Prettier ou SonarQube.
- PRs devem estar atualizados com a `dev` antes do merge (rebase ou merge da `dev`).
- Descrição clara é obrigatória — PR sem contexto será solicitado ajuste.

---

## 🎨 Guia de Estilo e Padrões de Código

### Convenções gerais
- **Idioma do código:** Inglês (variáveis, funções, classes, comentários técnicos).
- **Nomenclatura de variáveis/funções:** `nmExemplo` (camelCase com prefixo semântico quando aplicável).
- **Nomenclatura de arquivos:** `MeuArquivo.extensão` (PascalCase para componentes/classes).

### Boas práticas de manutenibilidade
- ❌ Evitar duplicação de código — criar **funções e módulos reutilizáveis**.
- ✅ Funções/métodos com **responsabilidade única** (SRP).
- ❌ Evitar aninhamento desnecessário (early returns quando possível).
- ❌ Evitar uso desnecessário de memória (ex.: variáveis criadas para uso único).
- ✅ **Code Review obrigatório** em todo PR.

---

## ✅ Definition of Ready (DoR)

Uma tarefa só pode ser puxada para desenvolvimento se cumprir **100%** dos itens abaixo:

- [ ] **História de Usuário padronizada:** *"Como [cliente/administrador], eu quero [ação] para que [benefício]"*.
- [ ] **Critérios de Aceite** descritos sem ambiguidade (ex.: "Não permitir cancelamento com menos de 2h de antecedência").
- [ ] **Regras de Negócio e Exceções mapeadas** (horário de pico, tarifas, limites por CPF).
- [ ] **Dependências mapeadas** (modelagem de banco, rotas de API).
- [ ] **Protótipo aprovado pelo PO** (para tarefas com interface).

---

## 🏁 Definition of Done (DoD)

Uma funcionalidade só é considerada **Concluída** se atender rigorosamente a:

- [ ] **Padrão de código** conforme o guia de estilo (React.js frontend / Java Spring Boot backend).
- [ ] **Code Review aprovado** por ≥ 1 dev/QA via Pull Request.
- [ ] **Validação de QA** nos ambientes de teste — sem bugs de severidade alta ou crítica em aberto.
- [ ] **Código mesclado na `dev`** sem conflitos de versionamento.
- [ ] **Documentação atualizada** — endpoints criados/alterados no Swagger/OpenAPI.

---

## 🔧 Gestão de Débito Técnico

### Registro
Todo atalho técnico, regra simplificada temporariamente ou pendência de refatoração deve ser registrado como **card no backlog do Jira com a tag `Débito Técnico`**, contendo:
- Justificativa da decisão.
- Localização no código.
- Impacto potencial na manutenibilidade.

### Priorização e Pagamento
- **15% do tempo útil de cada ciclo** dedicado à refatoração e pagamento de débitos.
- **Prioridade total** para débitos que causem:
  - Inconsistência na reserva de quadras.
  - Falha na autenticação de usuários.
  - Degradação do tempo de resposta da API de horários.

---

## 🧪 Estratégia de Testes

Legenda de prioridade: 🔴 crítico · 🟡 importante · 🟢 desejável

---

## 1. Módulo de Usuários

### Cadastro (`POST /users`)
- 🔴 Cadastrar usuário válido (nome, email, senha) → retorna id, nome, email; senha **não** deve voltar na resposta.
- 🔴 Verificar que a senha é gravada com hash (BCrypt), nunca em texto puro no banco.
- 🔴 Tentar cadastrar com email já existente → deve dar erro tratado (email é `UNIQUE` no banco). *Ver bug #1.*
- 🟡 Cadastrar com email em formato inválido (`teste`, `teste@`, `@dominio.com`).
- 🟡 Cadastrar com nome vazio / null / só espaços.
- 🟡 Cadastrar com senha vazia / muito curta.
- 🟡 Nome com 150 caracteres (limite) e 151 (deve falhar — `VARCHAR(150)`).
- 🟢 Campos com acentos, emojis e caracteres especiais.
- 🔴 Confirmar que todo usuário criado pela API vira perfil `CLIENT` (não é possível criar ADMIN via API). *Ver observação #6.*

### Login (`POST /users/login`)
- 🔴 Login com email e senha corretos → sucesso.
- 🔴 Login com senha errada → "Invalid email or password".
- 🔴 Login com email inexistente → mesma mensagem genérica (não revelar se o email existe).
- 🟡 Login com email em caixa diferente (`JOAO@x.com` vs `joao@x.com`) — validar comportamento esperado.
- 🟡 Login com campos vazios.
- 🔴 Confirmar o que o login retorna: hoje **não gera token/sessão**. Testar como isso afeta rotas protegidas. *Ver bug #4.*

### CRUD de usuário (`GET/PUT/DELETE /users/{id}`)
- 🔴 Buscar usuário existente / inexistente (404 esperado).
- 🟡 Atualização parcial: mandar só o nome → só nome muda; email e senha permanecem.
- 🟡 Atualizar com nome/email em branco → deve **ignorar** o campo (regra: só atualiza se não for blank).
- 🔴 Atualizar email para um já usado por outro usuário → conflito.
- 🔴 Deletar usuário e depois tentar buscá-lo → 404.
- 🔴 Deletar usuário que possui reservas → validar integridade (FK `fk_booking_user`). Não pode "quebrar" o banco.
- 🔴 Qualquer pessoa consegue chamar `DELETE /users/{id}`? *Ver bug #4 (falta de autorização).*
- 🟡 Listar reservas do usuário (`GET /users/{id}/bookings`) — usuário com reservas, sem reservas e inexistente.

---

## 2. Módulo de Quadras

### CRUD (`POST/PUT/DELETE /courts`)
- 🔴 Criar quadra sendo ADMIN → sucesso (tipo `COVERED`/`OPEN`, status default `ACTIVE`).
- 🔴 Criar quadra **sem ser admin** / sem header `X-User-Id` → 401/403.
- 🔴 Criar quadra passando `X-User-Id` de um usuário CLIENT → 403 "Admin only".
- 🔴 Criar com header `X-User-Id` inválido (texto, id inexistente) → 401.
- 🔴 Nome de quadra duplicado → erro tratado (`name` é `UNIQUE`). *Ver bug #1.*
- 🟡 Tipo inválido no enum (`court_type` só aceita COVERED/OPEN).
- 🟡 Atualizar status para `INACTIVE` e depois tentar reservar → deve bloquear.
- 🟡 Deletar quadra que tem reservas → validar FK `fk_booking_court`.
- 🟢 Listar todas as quadras (público) e buscar por id inexistente (404).

### ⚠️ Ponto de segurança
- 🔴 A autorização de admin é feita por um **header `X-User-Id`** — qualquer cliente pode forjar esse header e passar o id de um admin. Testar explicitamente esse bypass. *Ver bug #4.*

---

## 3. Módulo de Reservas

### Criar reserva (`POST /bookings`)
- 🔴 Reserva válida em quadra ATIVA → status `SCHEDULED`, preço calculado corretamente.
- 🔴 Reservar com `userId` inexistente → "User not found".
- 🔴 Reservar com `courtId` inexistente → "Court not found".
- 🔴 Reservar em quadra `INACTIVE` → "Court is inactive".
- 🔴 `endTime` igual a `startTime` → erro "End time must be after start time".
- 🔴 `endTime` **antes** de `startTime` → erro.
- 🟡 Reservar horário **no passado** → hoje é permitido; validar se deveria ser. *Ver bug #7.*
- 🟡 Reserva atravessando a meia-noite (ex.: 23h→01h do dia seguinte) — validar cálculo de preço por dia.
- 🟢 Datas com fuso/`LocalDateTime` — garantir consistência de timezone entre front e back.

### Sobreposição de horário (double booking) 🔴
- 🔴 Duas reservas na **mesma quadra** com horários que se sobrepõem → a segunda deve ser rejeitada (constraint `uq_booking_court_period`, só vale para status `SCHEDULED`).
- 🔴 Reservas encostadas sem sobrepor (10h–11h e 11h–12h) → **ambas** devem passar (range `[)`, fim exclusivo).
- 🟡 Sobreposição parcial (10h–11h e 10h30–11h30) → rejeita.
- 🟡 Mesma faixa em quadras **diferentes** → ambas passam.
- 🔴 Reservar, cancelar, e reservar o mesmo horário de novo → deve permitir (cancelada libera o slot).
- 🔴 **Como a API responde** quando a sobreposição bate na constraint do banco? *Ver bug #2 (provável HTTP 500 feio em vez de 409).*
- 🟡 `PUT /bookings/{id}` alterando o horário para colidir com outra reserva → validar mensagem. *Ver bug #3.*
- 🟢 Requisições simultâneas (corrida) pelo mesmo slot — teste de concorrência.

### Consultas de reserva
- 🟡 `GET /bookings/search?date=YYYY-MM-DD` → só reservas daquele dia.
- 🟡 `GET /bookings/search?date=...&courtId=...` → filtra por quadra.
- 🟡 Data em formato inválido no `search` → erro tratado (usa `LocalDate.parse`).
- 🟢 Dia sem reservas → lista vazia (não erro).
- 🟡 `GET /bookings/{id}` inexistente → 404.

### Atualizar / Deletar
- 🟡 Update parcial (só o horário, só a quadra) recalcula o preço corretamente.
- 🟡 Update trocando para quadra INACTIVE → deve bloquear.
- 🔴 `DELETE /bookings/{id}` é um **hard delete sem autorização** — qualquer um apaga qualquer reserva. Comparar com o fluxo de `cancel`. *Ver bug #4 e #8.*

---

## 4. Regra de Preço (testes de cálculo) 🔴

Regras no código: Aberta = R$100/h · Coberta = R$120/h · Horário de pico **18h–22h** com multiplicador **1.20** · cobrança **proporcional por minuto**.

- 🔴 Quadra ABERTA, 1h fora do pico → R$100,00.
- 🔴 Quadra COBERTA, 1h fora do pico → R$120,00.
- 🔴 1h inteira dentro do pico (ex.: 19h–20h), aberta → R$120,00 (100 × 1.20).
- 🔴 Reserva "meio a meio" (17h30–18h30) → 30min normal + 30min pico calculados separados.
- 🟡 Reserva de 30 min → metade do valor/hora.
- 🟡 Reserva começando exatamente às **18h00** e terminando às **22h00** → 4h inteiras de pico.
- 🟡 **Bordas do pico**: 17h59–18h00, 22h00–22h01 → conferir de que lado o minuto cai.
- 🟡 Reserva 12h–18h (encosta no início do pico, mas não entra) → tudo normal.
- 🟡 Arredondamento: valores com `HALF_UP` e 2 casas decimais — conferir centavos.
- 🟢 Reserva longa cruzando meia-noite → pico recalculado por dia (o loop reabre a janela 18–22 em cada dia).
- 🔴 Garantir que o preço nunca é negativo (`>= 0`).

---

## 5. Regra de Cancelamento e Reembolso (`POST /bookings/{id}/cancel`) 🔴

Regras no código: ≥ 24h antes = **100%** · ≥ 12h e < 24h = **50%** · < 12h = **0%** · não pode cancelar iniciada/concluída/já cancelada.

- 🔴 Cancelar com 25h de antecedência → reembolso integral.
- 🔴 Cancelar com 13h → 50%.
- 🔴 Cancelar com 5h → 0% (sem reembolso), mas status vira CANCELLED.
- 🔴 **Bordas** (atenção — o código usa `toHours()` que trunca):
  - Exatamente 24h → 100%.
  - 23h59min → cai para 50% (arredonda pra 23h). Validar se é o comportamento desejado.
  - Exatamente 12h → 50%; 11h59min → 0%.
- 🔴 Cancelar reserva **já iniciada** (now > startTime) → "Cannot cancel a booking that has already started".
- 🔴 Cancelar reserva **já cancelada** → "Booking already cancelled".
- 🔴 Cancelar reserva `COMPLETED` → "Completed bookings cannot be cancelled".
- 🟡 Após cancelar, `cancelled_at` é preenchido e status = CANCELLED.
- 🟡 Confirmar que a resposta traz o valor do reembolso correto.
- 🟢 A rota tem dois caminhos (`/bookings/{id}/cancel` e `/api/bookings/{id}/cancel`) — testar os dois. *Ver observação #9.*

---

## 6. Testes de Segurança 🔴

- 🔴 **Autorização quebrada**: `X-User-Id` como "autenticação" é facilmente forjável → escalonamento para admin.
- 🔴 Endpoints de usuários e reservas **não têm nenhuma checagem de autorização** — qualquer um lê/edita/apaga dados de qualquer um (IDOR).
- 🔴 Login sem token/sessão — não há como manter sessão nem expirar acesso.
- 🟡 SQL Injection nos parâmetros (`date`, ids) — mesmo com JPA, testar entradas maliciosas.
- 🟡 Exposição de dados: garantir que a senha (hash) nunca vaze em nenhuma resposta.
- 🟡 Mensagens de erro não devem expor stack trace / detalhes internos do banco.
- 🟢 CORS e headers de segurança configurados corretamente.
- 🟢 Rate limiting / brute force no login.

---

## 7. Testes de Frontend / UI / E2E

Componentes existentes: RegisterForm, LoginForm, Calendar, BookingModal, ReservationCard, ReservationSummary, ConfirmDialog, MyReservationsPage, BookingPage.

- 🔴 Fluxo completo: cadastro → login → ver calendário → reservar quadra → ver "Minhas Reservas" → cancelar.
- 🔴 Calendário: não permitir selecionar horário já ocupado; refletir reservas existentes.
- 🟡 Formulários: validação de campos obrigatórios, mensagens de erro visíveis, botão desabilitado enquanto envia.
- 🟡 Resumo da reserva (`ReservationSummary` / `getReservationCosts`) mostra o **mesmo preço** que o backend calcula (fonte única de verdade).
- 🟡 `ConfirmDialog` no cancelamento — confirmar/cancelar a ação.
- 🟡 Estados de loading, erro de rede e "lista vazia".
- 🟢 Responsividade (mobile/desktop) e acessibilidade (labels, navegação por teclado, contraste).
- 🟢 Compatibilidade entre navegadores.

---

## 8. Testes Não-Funcionais

- 🟡 **Performance**: tempo de resposta dos endpoints de listagem com muitas reservas (os índices `idx_bookings_*` existem — validar que são usados).
- 🟡 **Carga**: N reservas simultâneas na mesma quadra (concorrência + constraint).
- 🟢 Comportamento com banco indisponível (mensagens amigáveis, sem 500 cru).
- 🟢 Logs e observabilidade de erros.

---

## 9. Registro de Bugs 🐛

Bugs e riscos identificados durante os testes, documentados no formato **Passos esperados / Passos obtidos / Severidade**.
Severidade: 🔴 Alta · 🟡 Média · 🟢 Baixa. Status: `Aberto` (identificado) / `Confirmado` (reproduzido).

### Resumo

| ID | Título | Severidade | Status |
|---|---|---|---|
| BUG-01 | Autorização de admin por header `X-User-Id` (forjável) | 🔴 Alta | Aberto |
| BUG-02 | Endpoints de `/users` e `/bookings` sem autorização (IDOR) | 🔴 Alta | Aberto |
| BUG-03 | Login não gera token/sessão | 🔴 Alta | Aberto |
| BUG-04 | Sobreposição de reserva retorna HTTP 500 (create) | 🟡 Média | Aberto |
| BUG-05 | Update de reserva com conflito de horário retorna HTTP 500 | 🟡 Média | Aberto |
| BUG-06 | Email/nome duplicado retorna HTTP 500 (violação de UNIQUE) | 🟡 Média | Aberto |
| BUG-07 | Reserva com horário no passado é permitida | 🟡 Média | Aberto |
| BUG-08 | Reembolso trunca minutos (`toHours()`) | 🟡 Média | ✅ Confirmado |
| BUG-09 | `DELETE /bookings/{id}` é *hard delete* e ignora a regra de cancelamento | 🟢 Baixa | Aberto |
| BUG-10 | Rota de cancelamento duplicada | 🟢 Baixa | Aberto |
| BUG-11 | Não é possível criar perfil ADMIN pela API | 🟢 Baixa | Aberto |

---

### BUG-01 — Autorização de admin por header `X-User-Id` (forjável)
- **Componente:** `AuthService.ensureAdmin` · `CourtController`
- **Passos para reproduzir:** Como cliente comum, chamar `POST /courts` enviando o header `X-User-Id` com o id de um usuário ADMIN.
- **Passos esperados:** A criação de quadra só deve ser permitida a um administrador realmente autenticado.
- **Passos obtidos:** O header pode ser forjado por qualquer pessoa; passando o id de um admin, o cliente cria/edita quadras livremente (escalonamento de privilégio).
- **Severidade:** 🔴 Alta

### BUG-02 — Endpoints de `/users` e `/bookings` sem autorização (IDOR)
- **Componente:** `UserController` · `BookingController`
- **Passos para reproduzir:** Chamar `DELETE /users/{id}` ou `PUT /bookings/{id}` de outro usuário, sem qualquer autenticação.
- **Passos esperados:** Cada usuário só deve acessar/alterar os próprios dados e reservas.
- **Passos obtidos:** Qualquer um lê, edita e deleta dados e reservas de qualquer pessoa (Insecure Direct Object Reference).
- **Severidade:** 🔴 Alta

### BUG-03 — Login não gera token/sessão
- **Componente:** `UserService.login` · `SecurityConfig`
- **Passos para reproduzir:** Fazer `POST /users/login` com credenciais válidas e observar a resposta.
- **Passos esperados:** O login deveria retornar um token/sessão para controlar o acesso às rotas seguintes.
- **Passos obtidos:** Retorna apenas os dados do usuário; não há token nem sessão, então não existe controle de acesso real após o login.
- **Severidade:** 🔴 Alta

### BUG-04 — Sobreposição de reserva retorna HTTP 500 (create)
- **Componente:** `BookingService.create` · constraint `uq_booking_court_period`
- **Passos para reproduzir:** Criar uma reserva `SCHEDULED` numa quadra e, em seguida, criar outra na mesma quadra com horário sobreposto.
- **Passos esperados:** Retornar erro tratado (ex.: HTTP 409) com mensagem clara de "horário indisponível".
- **Passos obtidos:** O service não valida conflito em código; a constraint do banco estoura `DataIntegrityViolationException` sem tratamento → provável HTTP 500 com stack trace.
- **Severidade:** 🟡 Média

### BUG-05 — Update de reserva com conflito de horário retorna HTTP 500
- **Componente:** `BookingService.update`
- **Passos para reproduzir:** Fazer `PUT /bookings/{id}` alterando o horário para cima de outra reserva existente na mesma quadra.
- **Passos esperados:** Retornar erro tratado informando o conflito de horário.
- **Passos obtidos:** Cai na mesma violação de constraint do banco → provável HTTP 500.
- **Severidade:** 🟡 Média

### BUG-06 — Email/nome duplicado retorna HTTP 500 (violação de UNIQUE)
- **Componente:** `UserService.create` (email) · `CourtService.create` (nome)
- **Passos para reproduzir:** Cadastrar um usuário com email já existente, ou uma quadra com nome já existente.
- **Passos esperados:** Retornar HTTP 409/400 com mensagem amigável ("email já cadastrado").
- **Passos obtidos:** A duplicidade só é barrada pela constraint `UNIQUE` do banco → erro 500 cru.
- **Severidade:** 🟡 Média

### BUG-07 — Reserva com horário no passado é permitida
- **Componente:** `BookingService.create`
- **Passos para reproduzir:** Criar uma reserva com `startTime` anterior à data/hora atual.
- **Passos esperados:** Bloquear a reserva, informando que a data/hora já passou.
- **Passos obtidos:** A reserva é criada normalmente; não há validação de que o início é futuro.
- **Severidade:** 🟡 Média

### BUG-08 — Reembolso trunca minutos (`toHours()`) ✅ Confirmado
- **Componente:** `BookingService.cancel`
- **Passos para reproduzir:** Cancelar uma reserva faltando **23h59min** para o início (e, em outro caso, faltando **11h59min**).
- **Passos esperados:** 23h59min → dentro da faixa de 100% de reembolso; 11h59min → dentro da faixa de 50%.
- **Passos obtidos:** `Duration.toHours()` trunca os minutos → 23h59min é lido como 23h (reembolso de **50%**) e 11h59min como 11h (reembolso de **0%**). *Reproduzido em execução da lógica: ambos os casos caem para a faixa de baixo.*
- **Severidade:** 🟡 Média

### BUG-09 — `DELETE /bookings/{id}` é *hard delete* e ignora a regra de cancelamento
- **Componente:** `BookingService.delete` · `BookingController`
- **Passos para reproduzir:** Chamar `DELETE /bookings/{id}` numa reserva agendada.
- **Passos esperados:** O fluxo de cancelamento (`cancel`) deveria ser usado, preservando histórico e aplicando a regra de reembolso.
- **Passos obtidos:** A reserva é apagada fisicamente do banco, ignorando reembolso e histórico; coexiste de forma inconsistente com o `cancel` (soft delete).
- **Severidade:** 🟢 Baixa

### BUG-10 — Rota de cancelamento duplicada
- **Componente:** `BookingController.cancel`
- **Passos para reproduzir:** Observar o mapeamento: o endpoint responde tanto em `/bookings/{id}/cancel` quanto em `/api/bookings/{id}/cancel`.
- **Passos esperados:** Um único caminho oficial e documentado para o cancelamento.
- **Passos obtidos:** Dois caminhos ativos para a mesma ação (provável resíduo de desenvolvimento), gerando ambiguidade.
- **Severidade:** 🟢 Baixa

### BUG-11 — Não é possível criar perfil ADMIN pela API
- **Componente:** `UserService.create`
- **Passos para reproduzir:** Cadastrar um usuário via `POST /users` e verificar o perfil resultante.
- **Passos esperados:** Existir uma forma controlada de criar um administrador (ou documentar que é intencional).
- **Passos obtidos:** O `create` força sempre `CLIENT`; só é possível criar ADMIN alterando o banco diretamente.
- **Severidade:** 🟢 Baixa

---

## 10. Tipos de teste que já existem no repo

O backend já tem `BookingServiceTest.java` e `UserServiceTest.java` (testes unitários JUnit). Um bom próximo passo de QA:
- Cobrir os cenários acima que **ainda não** estão nesses testes (principalmente preço no pico, bordas de cancelamento e sobreposição).
- Adicionar **testes de integração** (com banco real/Testcontainers) pra validar as constraints do Postgres, que os testes unitários não pegam.
- Medir **cobertura** (o projeto cita SonarQube) e definir uma meta mínima.
---

## 🔄 CI/CD e Qualidade de Código

- **Ferramentas configuradas:** ESLint, Prettier e SonarQube.
- **Regra de integração:** Nenhum Pull Request será aprovado se a verificação automática acusar **erros críticos**.
- Toda merge na `dev` dispara verificação de qualidade.
- Merges na `main` são feitos apenas em pontos de release, com toda a suíte de verificações aprovada.

---

## 📌 Compromisso da Equipe

Todos os membros da equipe leram, concordam e se comprometem a seguir as diretrizes deste documento para garantir a **qualidade, manutenibilidade e entrega sustentável** do software.

- [x] Product Owner (PO) — Nathalia
- [x] Engenheira de Requisitos — Nathalia
- [x] Quality Assurance (QA) — Gabriel
- [x] Desenvolvedor Frontend — Murilo
- [x] Desenvolvedor Backend — Vinícius
- [x] DevOps — Miguel

---

*Documento baseado no Acordo de Manutenibilidade e Engenharia de Software elaborado em 07/08/2026.*
