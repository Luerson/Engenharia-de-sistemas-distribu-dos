# Tarefa 3 — SAST e DAST

## Objetivo

Comparar o resultado de análises de segurança:

1. antes das correções;
2. depois das correções.

### SAST
Foi escolhido o **Semgrep Community Edition**, que analisa o código-fonte sem executar a aplicação.

### DAST
Foi escolhido o **OWASP ZAP**, executado contra uma aplicação local em execução.

> Os resultados dos scans devem ser gerados localmente e salvos nas pastas `sast/antes`, `sast/depois`, `dast/antes` e `dast/depois`. Não invente resultados: os arquivos HTML/JSON devem ser os produzidos pelas ferramentas.

## 1. SAST

No diretório do repositório da Tarefa 2:

```bash
semgrep --config=auto codigo/vulneravel > ../Tarefa3_SAST_DAST/sast/antes/semgrep.txt
semgrep --config=auto codigo/corrigido > ../Tarefa3_SAST_DAST/sast/depois/semgrep.txt
```

Se o comando `semgrep` não existir:

```bash
python3 -m pip install --user semgrep
```

ou use Docker:

```bash
docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep --config=auto /src/codigo/vulneravel
docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep --config=auto /src/codigo/corrigido
```

Para gerar JSON:

```bash
semgrep --config=auto --json codigo/vulneravel > ../Tarefa3_SAST_DAST/sast/antes/semgrep.json
semgrep --config=auto --json codigo/corrigido > ../Tarefa3_SAST_DAST/sast/depois/semgrep.json
```

O Semgrep documenta `semgrep --config=auto` como forma de executar a análise local com regras da comunidade.

## 2. DAST

O DAST precisa de uma aplicação executando. Para esta atividade foi incluído um pequeno laboratório isolado em `app-vulneravel` e `app-corrigido`.

Instale as dependências em cada pasta:

```bash
cd app-vulneravel
npm install
node server.js
```

Em outro terminal, execute:

```bash
curl http://localhost:3000/
```

O servidor vulnerável ficará em:

```text
http://localhost:3000
```

Depois execute o ZAP:

```bash
mkdir -p dast/antes
docker run --rm -v "$PWD:/zap/wrk/:rw" ghcr.io/zaproxy/zaproxy:stable   zap-baseline.py -t http://host.docker.internal:3000   -r dast/antes/zap-report.html   -J dast/antes/zap-report.json
```

Se `host.docker.internal` não funcionar no Linux, descubra o IP do host pelo Docker:

```bash
ip -f inet -o addr show docker0 | awk '{print $4}' | cut -d/ -f1
```

e use, por exemplo:

```bash
zap-baseline.py -t http://172.17.0.1:3000
```

### Depois

Pare o servidor vulnerável, inicie o corrigido:

```bash
cd app-corrigido
npm install
node server.js
```

Repita o scan, salvando em `dast/depois`.

O ZAP Baseline realiza spider e análise passiva. Para uma análise dinâmica mais agressiva, pode-se utilizar o Full Scan:

```bash
docker run --rm -v "$PWD:/zap/wrk/:rw" ghcr.io/zaproxy/zaproxy:stable   zap-full-scan.py -t http://host.docker.internal:3000   -r dast/depois/zap-full-report.html
```

Use Full Scan somente no laboratório local da atividade.

## 3. O que entregar

Após executar os comandos, o repositório deve conter:

```text
Tarefa3_SAST_DAST/
├── README.md
├── RELATORIO.md
├── sast/
│   ├── antes/
│   │   ├── semgrep.txt
│   │   └── semgrep.json
│   └── depois/
│       ├── semgrep.txt
│       └── semgrep.json
└── dast/
    ├── antes/
    │   ├── zap-report.html
    │   └── zap-report.json
    └── depois/
        ├── zap-report.html
        └── zap-report.json
```
