# Agenda 360° - TODO List

## Banco de Dados e Schema
- [x] Criar tabelas: users, clients, products, suppliers, sales, financial_records, reports
- [x] Implementar migrations com Drizzle Kit
- [x] Adicionar índices e constraints para performance

## Backend - Procedimentos tRPC
- [x] Criar routers para clientes (list, create, update, delete)
- [x] Criar routers para produtos (list, create, update, delete)
- [x] Criar routers para fornecedores (list, create, update, delete)
- [x] Criar routers para vendas (list, create, update, delete)
- [x] Criar routers para financeiro (list, create, update, delete)
- [x] Criar routers para relatórios (métricas, gráficos)
- [x] Implementar sistema de permissões (admin vs funcionário)

## Autenticação
- [x] Integrar Manus OAuth (já pré-configurado)
- [x] Criar página de login
- [ ] Criar página de cadastro (se necessário)
- [ ] Implementar recuperação de senha
- [x] Adicionar proteção de rotas (protectedProcedure)

## Frontend - Interface
- [x] Criar layout principal com DashboardLayout
- [x] Implementar página de clientes
- [ ] Implementar página de produtos
- [ ] Implementar página de fornecedores
- [ ] Implementar página de vendas
- [ ] Implementar página de financeiro
- [ ] Implementar página de relatórios
- [x] Adicionar modais e formulários para CRUD

## Dashboard Administrativo
- [x] Criar dashboard com métricas de usuários ativos
- [x] Implementar gráficos de faturamento
- [x] Adicionar estatísticas de vendas
- [ ] Criar relatórios dinâmicos

## Integração e Deploy
- [ ] Configurar GitHub Actions para CI/CD
- [ ] Preparar instruções de deploy (AWS/Hostinger/DigitalOcean)
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de instalação local

## Preparação para Pagamentos
- [ ] Estruturar tabelas para planos e assinaturas
- [ ] Preparar integração com Stripe (estrutura)
- [ ] Preparar integração com Mercado Pago (estrutura)

## Testes e Qualidade
- [x] Escrever testes unitários (Vitest)
- [x] Testar fluxo de autenticação
- [x] Testar CRUD de todas as entidades
- [x] Validar permissões de acesso

## Documentação
- [ ] Criar README.md com instruções de setup
- [ ] Documentar API tRPC
- [ ] Criar guia de contribuição
- [ ] Documentar estrutura do projeto

## Integrações Entre Ferramentas
- [ ] Integrar Fornecedores com Financeiro (dar baixa em compra = registra saída no financeiro)
- [ ] Integrar Fornecedores com Calendário (mostrar eventos de pagamento)
- [ ] Integrar Vendas com Financeiro (registra entrada de dinheiro)
- [ ] Integrar Vendas com Calendário (mostrar eventos de venda)
- [ ] Integrar Produtos com Vendas (vincular produto à venda)
- [ ] Integrar Clientes com Vendas (vincular cliente à venda)
- [ ] Integrar Empréstimos com Financeiro (pagamento de parcela = registra entrada/saída)
- [ ] Integrar Empréstimos com Calendário (mostrar datas de parcelas com notificação)

## Próximas Tarefas - Fase de Expansão
- [ ] Clonar projeto do GitHub no computador do usuário
- [ ] Configurar GitHub Actions para CI/CD
- [ ] Fazer primeiro push para o GitHub
- [ ] Conectar ao Vercel para deploy automático


## Dashboard de Relatórios - Fase Atual
- [x] Criar procedures tRPC para estatísticas de tarefas
- [x] Criar página de Dashboard com gráficos de produtividade
- [x] Implementar gráficos de tarefas concluídas por semana
- [x] Implementar gráficos de análise de performance por membro
- [x] Implementar gráfico de fluxo de caixa integrado

## Interface de Notificações - Fase Atual
- [x] Implementar sino de notificações na navbar
- [x] Criar dropdown com lista de notificações não lidas
- [x] Implementar contador de notificações não lidas
- [x] Adicionar botão para marcar como lido
- [x] Integrar notificações com eventos do sistema


## Exportação de Relatórios em PDF
- [x] Criar função de geração de PDF com gráficos
- [x] Adicionar botão de exportação no Dashboard
- [x] Incluir dados de tarefas e financeiro no PDF
- [x] Testar exportação com diferentes períodos

## Alertas Automáticos
- [x] Criar função para detectar tarefas vencidas
- [x] Criar função para detectar anomalias financeiras
- [x] Implementar notificações automáticas no backend
- [x] Adicionar badge de alertas no Dashboard

## Comparativo de Períodos
- [x] Adicionar seletor de período (semana, mês, trimestre, ano)
- [x] Criar queries para comparar períodos
- [x] Implementar gráficos comparativos
- [x] Adicionar variação percentual (↑/↓)

## Melhorias na UX
- [x] Adicionar animações de transição nos gráficos
- [x] Melhorar responsividade em mobile
- [x] Adicionar loading states nos gráficos
- [x] Implementar dark mode completo
- [x] Adicionar tooltips informativos

## Correção da Página de Times
- [x] Corrigir erro de hook no Teams.tsx
- [x] Testar criação de times
- [x] Testar criação de tarefas
- [x] Testar Kanban com 3 colunas


## Correção de Duplicação de Sidebar
- [x] Investigar e identificar sidebars duplicados
- [x] Remover sidebars duplicados das páginas (Calendário, Times, etc)
- [x] Garantir sidebar único no Layout principal
- [x] Testar e validar interface limpa sem duplicação

## 🎨 REDESIGN MODERNO - NOVA INTERFACE
- [x] Criar novo layout com sidebar esquerda fixa (12 menu items)
- [x] Criar header com "Calendário", sino de notificações e user profile
- [x] Redesenhar calendário com grid profissional
- [x] Aplicar cores modernas: #0b0b0b (bg), #141414 (cards), #7c3aed (purple)
- [x] Remover header duplicado do Calendar
- [x] Atualizar App.tsx para usar ModernLayout
- [x] Adicionar todas as rotas faltantes
- [x] Testar todas as páginas - Sem erros 404
- [x] Validar navegação entre componentes
- [x] Substituir emojis coloridos por ícones monocromáticos


## 🐛 BUGS CRÍTICOS - FERRAMENTA DE EMPRÉSTIMO
- [x] Botão X para fechar modal não está funcionando - CORRIGIDO
- [x] Botão X do header para fechar página - CORRIGIDO (navega para Dashboard)
- [x] Ao criar empréstimo, gera múltiplos cadastros duplicados - CORRIGIDO
- [x] Deletados 18 registros duplicados do banco de dados
- [x] Adicionada proteção contra múltiplos submits com flag isSubmitting
- [x] Botão Criar desabilitado durante envio (mostra "Enviando...")
- [x] Validação de campos obrigatórios adicionada


## 📱 RESPONSIVIDADE DO CALENDÁRIO
- [x] Adicionar media queries para diferentes tamanhos de tela
- [x] Células do calendário se adaptam em mobile
- [x] Padding responsivo com max(16px, 2vw)
- [x] Altura automática em mobile, quadrado em desktop/tablet
- [x] Event listener para resize de janela


## 🎨 REDESIGN SAAS - DASHBOARD
- [x] Remover TODOS os gradientes
- [x] Remover brilhos e efeitos visuais
- [x] Implementar cores sólidas conforme especificação
- [x] Cards de métricas com cores específicas
- [x] Gráficos sem gradientes
- [x] Resumo financeiro com cores sólidas
- [x] Design SaaS real (tipo Stripe/Notion)
- [x] Adicionar métricas de tarefas
- [x] Atualizar getDashboardMetrics no servidor


## 🛒 PDV (PONTO DE VENDA) - NOVA FERRAMENTA
- [x] Atualizar schema: adicionar tabela de favoritos de produtos
- [x] Criar procedures tRPC para PDV (buscar produtos, criar venda, calcular troco)
- [x] Implementar componentes reutilizáveis (Modal, Carrinho, etc)
- [x] Criar tela de Atalhos (Mosaico de Produtos)
- [x] Criar tela de Busca Rápida de Produtos
- [x] Implementar Carrinho de Compras com descontos
- [x] Implementar Modal de Fechamento de Venda (pagamento e troco)
- [x] Integrar PDV na página de Vendas
- [x] Escrever testes unitários para lógica de cálculo
- [x] Revisar e corrigir bugs do PDV


## 🐛 BUGS REPORTADOS - PDV
- [x] Corrigir bug do buscador do PDV (loop infinito)
- [x] Trocar background branco por cinza do sistema (tema escuro)


## 🎨 REDESIGN DO PDV - NOVO LAYOUT
- [x] Redesenhar layout com produtos à esquerda e carrinho à direita
- [x] Adicionar botão PAGAR em destaque no carrinho
- [x] Melhorar visualização de descontos e totais
- [x] Testar novo layout


## 🔧 AJUSTES DO PDV - MELHORIAS
- [x] Remover scroll do carrinho - deixar Total + Botão PAGAR sempre visível
- [x] Atualizar opções de pagamento: Débito, Crédito, PIX, Pão, Dinheiro (sem palavra "Cartão")
- [x] Adicionar seleção de conta PIX no modal de pagamento
- [x] Testar ajustes


## 🔍 BUSCA DE CLIENTE NO PDV
- [x] Adicionar busca de cliente no modal de pagamento
- [x] Integrar com tRPC para buscar clientes
- [x] Testar busca de cliente


## 🐛 BUG - ÍCONE DO OLHO EM EMPRÉSTIMOS
- [x] Corrigir ícone do olho que não está funcionando na ferramenta Empréstimos


## 🐛 BUG - TypeError: Cannot read properties of undefined (reading 'length')
- [x] Investigar e corrigir erro de useEffect com undefined (removido ternário condicional)


## 💳 NOVO MODAL DE PAGAMENTO - EMPRÉSTIMOS
- [x] Criar novo modal de pagamento para Empréstimos
- [x] Implementar seleção de parcelas com opção de deletar
- [x] Integrar com contas bancárias do Financeiro
- [x] Substituir botão WhatsApp por botão Pagamento
- [x] Testar fluxo completo de pagamento


## 🐛 BUG - BOTÃO CRIAR CLIENTE NÃO FUNCIONA
- [x] Investigar por que o botão Criar Cliente não funciona
- [x] Permitir criar cliente com apenas nome (sem validação obrigatória)
- [x] Testar criação de cliente


## 🐛 BUG - BOTÃO CRIAR EMPRÉSTIMO NÃO FUNCIONA
- [x] Investigar por que o botão Criar Empréstimo não funciona
- [x] Corrigir validação de campos e envio de dados
- [x] Testar criação de empréstimo


## 🐛 BUG - PARCELAS NÃO APARECEM NO RESUMO DO EMPRÉSTIMO
- [x] Investigar por que as parcelas não aparecem no modal de resumo
- [x] Corrigir query de parcelas e exibição no modal
- [x] Testar exibição de parcelas


## 🐛 BUG - PARCELAS NÃO ESTÃO SENDO CRIADAS NO EMPRÉSTIMO
- [x] Parcelas não estão sendo criadas quando cria um empréstimo
- [x] Parcelas não aparecem no modal de resumo
- [x] Data de pagamento não está sendo salva nas parcelas
- [x] Data de pagamento não aparece corretamente na visualização

## 🔙 NAVEGAÇÃO - PÁGINA DE CONFIGURAÇÕES
- [x] Adicionar botão de voltar ao Dashboard na página de Configurações
- [x] Implementar link de volta no header ou sidebar
- [x] Testar navegação de volta


## 🐛 BUG - ZONA DE RISCO (APAGAR DADOS)
- [x] Implementar procedure tRPC para apagar todos os dados do usuário
- [x] Implementar procedure tRPC para deletar conta
- [x] Adicionar funções de banco de dados para deletar dados respeitando FK
- [x] Criar modal de confirmação no frontend
- [x] Conectar botões "Apagar Dados" e "Excluir Conta" com mutations tRPC
- [x] Testar funcionalidade de apagar dados


## 🐛 BUG - NOTIFICAÇÕES NÃO SÃO DELETADAS
- [x] Adicionar deleção de notificações à função deleteAllUserData
- [x] Conectar calendário ao banco de dados (remover mock data)
- [x] Implementar query tRPC para buscar eventos/notificações reais
- [x] Testar se as notificações são deletadas corretamente


## 📅 FEATURE - TAREFAS NO CALENDÁRIO (COMO GOOGLE AGENDA)
- [x] Adicionar query tRPC para buscar tarefas do usuário
- [x] Atualizar Calendar.tsx para exibir tarefas nas células por data
- [x] Implementar salvamento de tarefas criadas no calendário
- [x] Testar exibição de tarefas no calendário (com data e hora)


## 📄 FEATURE - FERRAMENTA RELATÓRIOS
- [x] Criar estrutura base do componente Relatórios com abas
- [x] Implementar aba Geral com resumo de todas as áreas
- [x] Implementar aba Financeiro com gráficos e histórico
- [x] Implementar abas Vendas, Clientes, Tarefas, Calendário e Empréstimos
- [x] Adicionar relatório inteligente e insights automáticos
- [x] Testar e validar a interface completa


## 🐛 BUG - CORES DE TEXTO RELATÓRIOS
- [x] Corrigir cores de texto para cinza claro na ferramenta Relatórios para melhor contraste
- [x] Corrigir cores dos botões de filtro de período (Hoje, Semana, Mês, Ano, Personalizado)
- [x] Corrigir cores dos botões "Ver detalhes"
- [x] Corrigir cores dos labels e legendas dos gráficos
- [x] Testar legibilidade de todos os textos


## 🐛 BUG - HIGHLIGHT BRANCO DE SELEÇÃO
- [x] Remover highlight branco de seleção de texto
- [x] Deixar apenas a seleção na própria palavra


## 🔄 REFATORAÇÃO - FERRAMENTA RELATÓRIOS
- [x] Redesenhar interface da ferramenta Relatórios
- [x] Implementar nova estrutura de componentes
- [x] Conectar dados reais ao banco de dados
- [x] Testar e validar a nova ferramenta


## 🎨 CORREÇÃO - INTERFACE RELATÓRIOS (MINIMALISTA)
- [x] Remover fundo azul escuro e usar #0B0B0C
- [x] Corrigir cores dos cards para #121212
- [x] Simplificar abas para estilo minimalista (apenas texto)
- [x] Remover bloco branco de seleção nas abas
- [x] Implementar hover #1A1A1A
- [x] Testar interface corrigida


## 🔗 FEATURE - RELATÓRIOS COM DADOS REAIS
- [x] Remover todos os dados mockados dos Relatórios
- [x] Implementar queries tRPC para buscar dados reais do banco
- [x] Conectar Relatórios para exibir dados dinâmicos
- [x] Testar se Relatórios refletem dados das outras ferramentas


## 🗑️ REMOVER - BLOCO DE NOTAS
- [x] Remover import e rota do Bloco de Notas do App.tsx
- [x] Remover botão de navegação do Bloco de Notas
- [x] Testar se a ferramenta foi removida

## 🎯 MENU LATERAL COM ÍCONES (META ADS MANAGER STYLE)
- [x] Criar novo componente CollapsibleSidebar com apenas ícones
- [x] Implementar animação de expansão ao clicar
- [x] Adicionar recolhimento automático após selecionar ferramenta
- [x] Testar em mobile e desktop
- [x] Integrar ao ModernLayout
- [x] Sidebar recua completamente ao clicar em ícone (oculta totalmente)
- [x] Adicionar botão de menu hambúrguer no header

## 🐛 BUG - GRÁFICO FINANCEIRO ACHATADO
- [x] Corrigir escala do gráfico durante transições de dados
  - [x] Normalizar dados (null/undefined → 0)
  - [x] Configurar escala fixa do eixo Y com margem dinâmica
  - [x] Manter último estado durante transições
  - [x] Testar com valores zerados e baixos


## 🏷️ SISTEMA DE CATEGORIAS DINÂMICAS - FINANCEIRO
- [x] Criar tabela de categorias no schema (expense_categories)
- [x] Implementar tRPC procedures para CRUD de categorias (create, list, delete, update)
- [x] Criar componente Combobox com autocomplete para categorias
- [x] Integrar campo de categoria no modal de Nova Saída
- [x] Adicionar validação de duplicatas (case-insensitive)
- [x] Implementar criação rápida de categorias com toast de sucesso
- [x] Adicionar categorias padrão iniciais (Supermercado, Aluguel, Funcionários, Escola, Transporte, Outros)
- [x] Testar fluxo completo de seleção e criação de categorias
- [x] Validar persistência de categorias no banco de dados


## ⚙️ PÁGINA DE CONFIGURAÇÕES - GERENCIAMENTO DE CATEGORIAS
- [x] Criar página Settings.tsx com interface profissional
- [x] Implementar tabela de categorias com colunas: Nome, Ícone, Cor, Uso, Ações
- [x] Adicionar formulário de criação de categoria com validação
- [x] Implementar edição de categoria (nome, Ícone, cor)
- [x] Implementar deleção de categoria com confirmação
- [x] Adicionar botão "Gerenciar Categorias" no menu lateral
- [x] Integrar rota /configuracoes no App.tsx
- [x] Testar CRUD completo de categorias
- [x] Validar integração com modal de Nova Saída


## 💰 CONTAS DE DINHEIRO FÍSICO - FINANCEIRO
- [ ] Atualizar schema bankAccounts para adicionar campo "accountType" (checking, savings, investment, cash)
- [ ] Gerar migration SQL para adicionar novo campo
- [ ] Executar migration no banco de dados
- [ ] Implementar procedures para criar conta de dinheiro
- [ ] Adicionar seletor de tipo de conta no modal de cadastro
- [ ] Ocultar campos específicos de banco quando tipo = "cash"
- [ ] Testar criação de conta de dinheiro físico
- [ ] Validar que contas de dinheiro aparecem na lista de contas
- [ ] Testar transação com conta de dinheiro


## 🐛 BUG - TRANSAÇÕES NÃO ATUALIZAVAM SALDO DAS CONTAS
- [x] Investigar por que transações de entrada/saída não atualizavam o saldo das contas individuais
- [x] Corrigir schema para fazer bankName e accountNumber nullable para contas cash
- [x] Modificar código do Financial.tsx para encontrar o ID da conta de dinheiro corretamente
- [x] Adicionar invalidate de bankAccounts.list para atualizar saldo das contas
- [x] Testar transações de entrada com contas de dinheiro físico
- [x] Testar transações de saída com contas de dinheiro físico
- [x] Validar que o saldo é atualizado corretamente em ambos os casos


## 🐛 BUG - TRANSAÇÕES NÃO APARECIAM NO HISTÓRICO DO FINANCEIRO
- [x] Investigar por que a transação de R$ 4.20 não aparecia no histórico
- [x] Descobrir que as transações estavam ordenadas em ordem crescente (mais antigas primeiro)
- [x] Corrigir a função getFinancialTransactionsByUserId para ordenar em ordem decrescente
- [x] Adicionar .desc() ao orderBy para mostrar transações mais recentes primeiro
- [x] Testar e validar que a transação de R$ 4.20 agora aparece no histórico


## 📱 FEATURE - VERSÃO MOBILE DO FINANCEIRO
- [ ] Analisar estrutura atual do Financial.tsx
- [ ] Criar layout mobile-first com media queries
- [ ] Implementar card de saldo principal em destaque
- [ ] Transformar 4 cards resumo em scroll horizontal
- [ ] Adaptar gráfico para mobile (reduzir altura)
- [ ] Transformar contas bancárias em lista vertical
- [ ] Reorganizar histórico de transações para mobile
- [ ] Criar botões fixos no rodapé (Nova Entrada/Saída)
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Validar que desktop permanece 100% intacto
- [ ] Validar que funcionalidades continuam funcionando


## 📱 FEATURE - VERSÃO MOBILE DO FINANCEIRO ✅ COMPLETO
- [x] Criar layout mobile responsivo com hook useWindowSize
- [x] Transformar cards resumo em scroll horizontal
- [x] Criar contas bancárias em lista vertical
- [x] Implementar botões fixos no rodapé (Nova Entrada + Nova Saída)
- [x] Testar responsividade em diferentes tamanhos
- [x] Validar que desktop permanece 100% intacto
- [x] Criar componente FinancialMobile.tsx separado
- [x] Integrar detecção automática de viewport no Financial.tsx


## 🎯 FEATURE - AGENDAMENTOS COM CLIENTES NO CALENDÁRIO
- [ ] Analisar estrutura do Calendar.tsx e modal de criação
- [ ] Estender formulário com campos: Cliente, Tipo de Ação, Observação
- [ ] Integrar seleção de cliente com autocomplete
- [ ] Testar fluxo completo de agendamento
- [ ] Validar compatibilidade com funcionalidades existentes


## 📅 FEATURE - FLUXO COMPLETO DE CRIAÇÃO DE AGENDAMENTOS (CALENDÁRIO)
- [x] Adicionar campo de Cliente ao formulário de criação de tarefas
- [x] Adicionar campo de Tipo de Ação (Reunião, Visita, Trabalho) ao formulário
- [x] Adicionar campo de Observação/Descrição ao formulário
- [x] Estender schema da tabela tasks com campos clientId e actionType
- [x] Gerar migration SQL com Drizzle Kit
- [x] Executar migration no banco de dados
- [x] Atualizar procedures tRPC para aceitar novos campos
- [x] Atualizar componente Calendar.tsx para enviar novos campos
- [x] Testar criação de agendamento com cliente
- [x] Testar criação de agendamento com tipo de ação "Reunião"
- [x] Testar criação de agendamento com tipo de ação "Visita"
- [x] Testar criação de agendamento com tipo de ação "Trabalho"
- [x] Testar persistência de dados no banco de dados
- [x] Validar que agendamentos aparecem corretamente no calendário
- [x] Validar que nenhuma funcionalidade existente foi quebrada


## 🐛 BUG CRÍTICO - CARD "SAÍDAS NO MÊS" NÃO ATUALIZAVA
- [x] Investigar por que o card "Saídas no Mês" não atualizava após pagamentos de fornecedores
- [x] Verificar se a invalidação de cache estava funcionando corretamente
- [x] Testar fluxo completo: criar compra → pagar → verificar atualização
- [x] Confirmar que o card agora atualiza de R$ 100.00 para R$ 300.00 após pagamento de R$ 200.00
- [x] Validar que todas as transações aparecem corretamente no histórico
- [x] Confirmar que a integração Fornecedores-Financeiro está funcionando perfeitamente

## 📅 FEATURE - INTEGRAÇÃO CALENDÁRIO-FORNECEDORES (PRÓXIMA FASE)
- [ ] Analisar estrutura de sincronização entre fornecedores e calendário
- [ ] Verificar se eventos de pagamento estão sendo criados automaticamente
- [ ] Implementar sincronização bidirecional (editar data de vencimento)
- [ ] Adicionar filtros de visualização no calendário
- [ ] Testar fluxo completo de sincronização
- [ ] Validar que eventos são removidos ao pagar contas


## 🔗 INTEGRAÇÃO CALENDÁRIO-FORNECEDORES - CONCLUÍDA
- [x] Estender schema com campo calendarEventId
- [x] Adicionar campo paymentStatus e paidDate ao supplierPurchases
- [x] Criar funções de sincronização: createSupplierPaymentEvent, updateSupplierPaymentEvent, removeSupplierPaymentEvent
- [x] Implementar sincronização automática na criação de compras
- [x] Implementar sincronização ao editar data de vencimento
- [x] Implementar remoção de evento ao pagar compra
- [x] Adicionar filtros de visualização no calendário (Tarefas Manuais / Pagamentos de Fornecedores)
- [x] Implementar cores diferentes para eventos sincronizados (purple vs red)
- [x] Escrever testes unitários para integração
- [x] Validar fluxo completo: criar compra → evento criado → editar data → evento atualizado → pagar → evento removido


## 🐛 BUG CRÍTICO - TRANSAÇÕES DE PAGAMENTO NÃO APARECEM NO FINANCEIRO - RESOLVIDO
- [x] Investigar por que transações de pagamento de fornecedores não aparecem no histórico
- [x] Verificar se a transação está sendo criada no banco de dados
- [x] Verificar se o card "Saídas no Mês" está sendo atualizado
- [x] Corrigir o procedimento de pagamento (supplierPurchases.pay)
- [x] Testar pagamento: R$ 66 para fornecedor "Fortaleza" via PIX na conta Itaú
- [x] Criar tabela financialTransactions no banco de dados
- [x] Validar que transações agora aparecem no Financeiro
- [x] Validar que card "Saídas no Mês" atualiza corretamente


## 📋 PADRONIZAÇÃO DE EMPRÉSTIMOS - JUROS SIMPLES - CONCLUÍDO
- [x] Analisar implementação atual do módulo de Empréstimos
- [x] Revisar schema da tabela loans
- [x] Revisar procedimentos tRPC de empréstimos
- [x] Implementar cálculo de juros simples (fixo) no backend
- [x] Remover seleção de tipo de juros do frontend
- [x] Ajustar cálculo: valor_total = valor_inicial + (valor_inicial * percentual_juros)
- [x] Garantir que juros são calculados apenas uma vez na criação
- [x] Implementar pagamentos parciais sem recalcular juros
- [x] Escrever testes unitários para validar cálculos (15 testes passando)
- [x] Testar fluxo completo: criar empréstimo → pagar parcelas → validar saldo
- [x] Validar precisão financeira em todos os cenários


## 💰 PAGAMENTO PARCIAL DE EMPRÉSTIMOS - NOVA FEATURE
- [x] Atualizar schema: adicionar status "partially_paid" para parcelas
- [x] Implementar lógica de recalculação de juros com taxa original (handlePartialLoanPayment)
- [x] Criar procedure tRPC para pagamento parcial (recordPayment com paymentType="partial")
- [x] Atualizar modal de pagamento para permitir valores parciais
- [x] Implementar validação de valores parciais
- [x] Criar nova parcela com saldo recalculado + juros
- [x] Marcar parcela anterior como "parcialmente paga"
- [x] Implementar UI com radio buttons para Pagamento Completo/Parcial
- [x] Adicionar campo de entrada para valor customizado
- [x] Validar recalculação de juros com diferentes taxas

## 🐛 BUGS - PAGAMENTO DE EMPRÉSTIMOS - CORRIGIDOS
- [x] Bug 1: Pagamento não estava sendo registrado como pago - CORRIGIDO
- [x] Bug 2: Pagamento parcial não estava funcionando - CORRIGIDO
- [x] Validado: Pagamento parcial de R$ 100 em parcela de R$ 165 funcionando
- [x] Validado: Nova parcela criada com saldo recalculado (R$ 71.50 com 10% juros)[ ] Status das parcelas não está sendo atualizado após pagamento


## 🎨 AJUSTE - EXIBIÇÃO DE PARCELAS NO MODAL DE RESUMO
- [x] Adicionar scroll vertical na seção de parcelas (maxHeight: 400px)
- [x] Aumentar altura e padding de cada parcela (padding: 16px, fontSize: 13px)
- [x] Melhorar legibilidade do layout (Parcela, Data, Valor, Status)
- [x] Testar com 3 parcelas - Validado e funcionando perfeitamente
- [x] Remover scroll das parcelas - Todas visíveis sem scroll

## 📏 AJUSTE - ALTURA DO MODAL DE RESUMO
- [x] Aumentar maxHeight do modal para 90vh
- [x] Adicionar scroll interno quando necessário
- [x] Validar visualização de todas as informações do topo
- [x] Testar com múltiplas parcelas


## ⚡ OTIMIZAÇÃO - BOTÃO COPIAR
- [x] Investigar o delay ao clicar em Copiar - Identificado: alert() bloqueava a interface
- [x] Otimizar a função de cópia de informações - Removido alert(), adicionado await
- [x] Reduzir tempo de resposta - Feedback visual imediato com mudança de cor
- [x] Testar com múltiplas parcelas - Validado e funcionando perfeitamente


## 🔍 AUDITORIA - DELAYS DE ATUALIZAÇÃO DE DADOS
- [ ] Verificar atualização em Clientes (criar, editar, deletar)
- [ ] Verificar atualização em Fornecedores (criar, editar, deletar)
- [ ] Verificar atualização em Produtos (criar, editar, deletar)
- [ ] Verificar atualização em Vendas (criar, editar, deletar)
- [ ] Verificar atualização em Financeiro (transações, contas)
- [ ] Verificar atualização em Empréstimos (criar, pagar, editar)
- [ ] Verificar atualização em Tarefas (criar, editar, completar)
- [ ] Verificar atualização em Times (criar, editar, deletar)
- [ ] Verificar refetch/invalidate em todas as mutations
- [ ] Adicionar loading states em todas as ações
- [ ] Consolidar requisições desnecessárias
- [ ] Testar resposta imediata após cada ação


## ⚡ AUDITORIA DE PERFORMANCE REAL - FASE 2
- [ ] Instrumentar APIs com logging de tempo (ms)
- [ ] Medir tempo de cada mutation/query
- [ ] Identificar endpoints acima de 300ms
- [ ] Mapear cascata: pagamento fornecedor
- [ ] Mapear cascata: pagamento empréstimo
- [ ] Mapear cascata: criação agendamento
- [ ] Auditar queries do banco (N+1, índices)
- [ ] Verificar operações pesadas/síncronas
- [ ] Otimizar Calendar (refetch desnecessário?)
- [ ] Implementar optimistic updates reais
- [ ] Validar UI atualiza ANTES da API
- [ ] Testar performance com múltiplas ações


## 🚀 OTIMIZAÇÃO PROFUNDA - ESCALABILIDADE
- [ ] Revisar JOINs em loans.list - eliminar N+1
- [ ] Implementar GROUP BY + agregações corretas
- [ ] Validar duplicação de registros em JOINs
- [ ] Implementar paginação em loans.list
- [ ] Implementar paginação em sales.list
- [ ] Implementar paginação em clients.list
- [ ] Implementar paginação em financial.transactions
- [ ] Criar cache de saldo financeiro
- [ ] Atualizar saldo no momento da transação
- [ ] Implementar debounce em search
- [ ] Implementar throttle em cliques de pagamento
- [ ] Validar connection pool do banco
- [ ] Testar consistência com múltiplas parcelas
- [ ] Testar escalabilidade com 1000+ registros


## 🎯 BOTÃO COPIAR - FEEDBACK IMEDIATO
- [x] Criar componente CopyButton reutilizável
- [x] Implementar feedback visual instantâneo (sem async)
- [x] Adicionar efeito de clique (scale/opacity)
- [x] Implementar animação suave (150ms)
- [x] Integrar no modal de Empréstimos
- [x] Testar responsividade em diferentes dispositivos
- [x] Validar feedback visual imediato


## 🔄 CORREÇÃO - ATUALIZAÇÃO DE DADOS EM TEMPO REAL (EMPRÉSTIMOS)
- [x] Identificar queries utilizadas: loans.list, loans.getInstallments
- [x] Implementar invalidação correta de loans.getById após mutations
- [x] Adicionar invalidação de loans.getInstallments com loanId específico
- [x] Implementar atualização otimista com setData para refletir mudanças imediatamente
- [x] Testar atualização de dados após pagamento na mesma tela
- [x] Validar que dados atualizam sem necessidade de trocar de rota

## ✅ CORREÇÃO FINAL - SINCRONIZAÇÃO DE DADOS (EMPRÉSTIMOS)
- [x] Reverter mudanças que quebraram atualização
- [x] Identificar problema: selectedLoan não era atualizado após pagamento
- [x] Implementar atualização de selectedLoan em onPaymentSuccess
- [x] Testar fluxo: pagamento → resumo atualizado → copiar dados corretos
- [x] Validar que tudo funciona na mesma tela sem sair da ferramenta


## 🐛 BUG - CHECKBOXES DAS PARCELAS NÃO FUNCIONAM
- [x] Investigar por que checkboxes não respondem ao clique direto
- [x] Corrigir evento de clique dos checkboxes
- [x] Garantir que clique no checkbox seleciona/deseleciona a parcela
- [x] Testar seleção múltipla de parcelas via checkbox


## 📅 INTEGRAÇÃO - PARCELAS VENCIDAS NO CALENDÁRIO
- [x] Verificar se parcelas vencidas aparecem no Calendário
- [x] Implementar exibição de devedores com parcelas vencidas no Calendário
- [x] Adicionar filtro para mostrar/ocultar parcelas de empréstimos
- [x] Testar integração completa
