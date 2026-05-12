-- CreateEnum
CREATE TYPE "CategoriaCompra" AS ENUM ('MATERIA_PRIMA', 'INSUMO', 'DESPESA_OPERACIONAL', 'DESPESA_ADMINISTRATIVA', 'OUTROS');

-- CreateEnum
CREATE TYPE "CondicaoPagamento" AS ENUM ('A_VISTA', 'A_PRAZO', 'PARCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'BOLETO', 'TRANSFERENCIA', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('A_PAGAR', 'PAGO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('CAIXA', 'KG', 'UNIDADE', 'SACO', 'LITRO', 'DUZIA', 'FARDO');

-- CreateEnum
CREATE TYPE "StatusProducao" AS ENUM ('RASCUNHO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "AmbienteNF" AS ENUM ('PRODUCAO', 'HOMOLOGACAO');

-- CreateEnum
CREATE TYPE "StatusNF" AS ENUM ('RASCUNHO', 'AUTORIZADA', 'CANCELADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "StatusFinanceiro" AS ENUM ('A_RECEBER', 'RECEBIDO');

-- CreateEnum
CREATE TYPE "FormaAcerto" AS ENUM ('ABATIMENTO', 'DEVOLUCAO_DINHEIRO', 'CREDITO');

-- CreateEnum
CREATE TYPE "StatusDevolucao" AS ENUM ('PENDENTE', 'ACERTADA');

-- CreateEnum
CREATE TYPE "TipoConta" AS ENUM ('CAIXA_FISICO', 'CONTA_CORRENTE', 'CONTA_POUPANCA');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentroCusto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "CentroCusto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpjCpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "categoria" "CategoriaCompra" NOT NULL DEFAULT 'MATERIA_PRIMA',
    "centroCustoId" TEXT,
    "observacao" TEXT,
    "condicao" "CondicaoPagamento" NOT NULL DEFAULT 'A_VISTA',
    "vencimento" TIMESTAMP(3) NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL DEFAULT 'PIX',
    "status" "StatusPagamento" NOT NULL DEFAULT 'A_PAGAR',
    "totalValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCompra" (
    "id" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroProducao" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "StatusProducao" NOT NULL DEFAULT 'RASCUNHO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaProducao" (
    "id" TEXT NOT NULL,
    "registroProducaoId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custoUnit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EntradaProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaidaProducao" (
    "id" TEXT NOT NULL,
    "registroProducaoId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custoUnit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaidaProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produtor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produtor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parceiro" (
    "id" TEXT NOT NULL,
    "produtorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpjCpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL,
    "numero" TEXT,
    "serie" TEXT DEFAULT '1',
    "clienteId" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" TIMESTAMP(3),
    "ambiente" "AmbienteNF" NOT NULL DEFAULT 'PRODUCAO',
    "status" "StatusNF" NOT NULL DEFAULT 'RASCUNHO',
    "chaveAcesso" TEXT,
    "totalValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statusFinanceiro" "StatusFinanceiro" NOT NULL DEFAULT 'A_RECEBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemNF" (
    "id" TEXT NOT NULL,
    "notaFiscalId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "ncm" TEXT,
    "cfop" TEXT,

    CONSTRAINT "ItemNF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Devolucao" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nfReferencia" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "totalValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "formaAcerto" "FormaAcerto" NOT NULL DEFAULT 'ABATIMENTO',
    "status" "StatusDevolucao" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDevolucao" (
    "id" TEXT NOT NULL,
    "devolucaoId" TEXT NOT NULL,
    "produto" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemDevolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaBancaria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoConta" NOT NULL DEFAULT 'CONTA_CORRENTE',
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "contaBancariaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "conciliado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produtor_cpf_key" ON "Produtor"("cpf");

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "CentroCusto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaProducao" ADD CONSTRAINT "EntradaProducao_registroProducaoId_fkey" FOREIGN KEY ("registroProducaoId") REFERENCES "RegistroProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaidaProducao" ADD CONSTRAINT "SaidaProducao_registroProducaoId_fkey" FOREIGN KEY ("registroProducaoId") REFERENCES "RegistroProducao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parceiro" ADD CONSTRAINT "Parceiro_produtorId_fkey" FOREIGN KEY ("produtorId") REFERENCES "Produtor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemNF" ADD CONSTRAINT "ItemNF_notaFiscalId_fkey" FOREIGN KEY ("notaFiscalId") REFERENCES "NotaFiscal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Devolucao" ADD CONSTRAINT "Devolucao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDevolucao" ADD CONSTRAINT "ItemDevolucao_devolucaoId_fkey" FOREIGN KEY ("devolucaoId") REFERENCES "Devolucao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
