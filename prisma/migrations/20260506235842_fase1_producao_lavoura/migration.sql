-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DONO', 'PARCEIRO', 'GERENTE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'DONO';

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL DEFAULT 'CAIXA',
    "categoria" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColheitaDiaria" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidadeTotal" DOUBLE PRECISION NOT NULL,
    "quantidadeDono" DOUBLE PRECISION NOT NULL,
    "quantidadeParceiro" DOUBLE PRECISION NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColheitaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaidaLavoura" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnit" DOUBLE PRECISION NOT NULL,
    "totalValor" DOUBLE PRECISION NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaidaLavoura_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ColheitaDiaria" ADD CONSTRAINT "ColheitaDiaria_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColheitaDiaria" ADD CONSTRAINT "ColheitaDiaria_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaidaLavoura" ADD CONSTRAINT "SaidaLavoura_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaidaLavoura" ADD CONSTRAINT "SaidaLavoura_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
