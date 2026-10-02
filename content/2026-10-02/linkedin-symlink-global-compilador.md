---
date: 2026-10-02
pillar: build-public
format: linkedin (lesson)
source: git diff HEAD -- scripts/ (compile-contracts.sh, pre-deploy-check.sh), ainda não commitado. Sem log de dev do dia.
  Pendência declarada: no diff, o bloco novo de checagem runtime-vs-artefato em pre-deploy-check.sh está aninhado
  dentro do `else` (compactc ausente) — pela leitura, só executaria nesse caso. `bash -n` passa; comportamento não testado.
---

Um build "verde" que não roda.

Esta semana o lab de contratos Midnight compilava os 3 contratos sem erro, mas todo script de deploy quebrava no import: "Version mismatch".

O que aconteceu: o symlink global do compilador apontava para a 0.31.0. Essa versão gera artefatos que exigem compact-runtime 0.16.0. O projeto fixa 0.14.0. Nada na compilação avisa isso.

A correção foi tirar o PATH da equação: compile-contracts.sh e pre-deploy-check.sh agora usam o caminho versionado do compilador (0.29.0, o da matriz de versões do preprod).

Medido nos artefatos recompilados: compiler-version 0.29.0 e checkRuntimeVersion('0.14.0') nos três contratos, igual ao runtime instalado.

O que ainda não está provado: não rodei deploy. E a checagem nova no pre-deploy (artefato vs runtime instalado) pela leitura do diff está dentro do ramo "compactc ausente" — precisa ser movida pra fora antes de valer como guarda.

Moral: o efeito que importa é o artefato importar no runtime que você tem, não o compilador terminar com exit 0.

#BuildInPublic #MidnightForDevs #DPO2U
