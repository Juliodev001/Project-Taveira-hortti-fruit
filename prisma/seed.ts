import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // User admin
  const hashed = await bcrypt.hash('docampo2026', 10)
  await prisma.user.upsert({
    where: { email: 'admin@docampo.com.br' },
    update: {},
    create: { name: 'Administrador', email: 'admin@docampo.com.br', password: hashed },
  })

  // Contas bancárias padrão
  const contasExistentes = await prisma.contaBancaria.count()
  if (contasExistentes === 0) {
    await prisma.contaBancaria.createMany({
      data: [
        { nome: 'Caixa Físico', tipo: 'CAIXA_FISICO', saldoInicial: 0 },
        { nome: 'Itaú', tipo: 'CONTA_CORRENTE', saldoInicial: 0 },
        { nome: 'Sicoob', tipo: 'CONTA_CORRENTE', saldoInicial: 0 },
      ],
    })
  }

  // Centros de custo
  const centrosExistentes = await prisma.centroCusto.count()
  if (centrosExistentes === 0) {
    await prisma.centroCusto.createMany({
      data: [
        { nome: 'Produção' },
        { nome: 'Administrativo' },
        { nome: 'Comercial' },
        { nome: 'Logística' },
      ],
    })
  }

  // Produtos padrão da lavoura
  const produtosExistentes = await prisma.produto.count()
  if (produtosExistentes === 0) {
    await prisma.produto.createMany({
      data: [
        { nome: 'Morango', unidade: 'CAIXA', categoria: 'Fruta' },
        { nome: 'Tomate', unidade: 'CAIXA', categoria: 'Hortaliça' },
        { nome: 'Alface', unidade: 'CAIXA', categoria: 'Hortaliça' },
        { nome: 'Pimentão', unidade: 'CAIXA', categoria: 'Legume' },
      ],
    })
  }

  console.log('✅ Seed concluído!')
  console.log('   Login: admin@docampo.com.br')
  console.log('   Senha: docampo2026')
}

main().catch(console.error).finally(() => prisma.$disconnect())
