# Tarefa 3 — Relatório de SAST e DAST

## 1. Objetivo

A atividade compara a aplicação antes e depois das correções de segurança. Foram utilizados:

- **SAST:** Semgrep Community Edition;
- **DAST:** OWASP ZAP.

O SAST analisa o código-fonte sem executá-lo. O DAST analisa a aplicação em execução.

## 2. SAST — antes

O código vulnerável foi analisado com:

```bash
semgrep --config=auto codigo/vulneravel
```

Resultado completo: `sast/antes/`.

### Principais vulnerabilidades observadas

A execução do Semgrep no repositório vulnerável identificou **3 alertas** (todos marcados como *blocking*) distribuídos em 2 arquivos:

| Regra / Vulnerabilidade | Arquivo | Linha(s) | Descrição / Correção Recomendada |
|---|---|---|---|
| `javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret` | `auth.js` | 16, 25 | Credencial/segredo JWT fixado no código-fonte. Recomendado mover para variável de ambiente (`process.env`). |
| `javascript.express.security.audit.express-check-csurf-middleware-usage` | `server.js` | 3 | Ausência de middleware de proteção CSRF detectado na aplicação Express. Requer adição do middleware `csurf`/`csrf` ou validação por tokens. |

---

## 3. SAST — depois

O código corrigido foi analisado com:

```bash
semgrep --config=auto codigo/corrigido
```

Resultado completo: `sast/depois/`.

O objetivo é verificar a redução dos padrões inseguros encontrados no código original.

### Principais vulnerabilidades observadas

A análise do código corrigido retornou **1 alerta** (1 *blocking*), indicando a remoção do alerta de segredo embutido e a persistência do alerta de CSRF:

| Regra / Vulnerabilidade | Arquivo | Linha | Status | Observação |
|---|---|---|---|---|
| `javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret` | `auth.js` | — | **Corrigido** | A chave JWT hardcoded foi removida e substituída por variável de ambiente (0 alertas). |
| `javascript.express.security.audit.express-check-csurf-middleware-usage` | `server.js` | 7 | **Pendente** | O aviso de ausência de middleware CSRF persiste na inicialização do Express. |

### Resumo Comparativo do SAST

| Métrica | Código Vulnerável (`antes`) | Código Corrigido (`depois`) | Variação |
|---|---|---|---|
| Arquivos Analisados | 4 | 4 | 0 |
| Regras Executadas | 200 | 200 | 0 |
| Total de Achados (*Findings*) | 3 | 1 | **-66,7%** |
| Hardcoded JWT Secret (`auth.js`) | 2 | 0 | **Corrigido** |
| Middleware CSRF (`server.js`) | 1 | 1 | **Pendente** |

- **Remediação de Segredos:** A refatoração em `auth.js` eliminou com sucesso os alertas de credencial hardcoded.
- **Pendência Residual:** O Semgrep continuou apontando a ausência de middleware CSRF formal no `server.js` (linha 7). Para zerar totalmente os alertas do SAST, deve-se integrar explicitamente um middleware de CSRF (como `csurf` ou similar) na aplicação Express.


