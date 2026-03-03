/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';

async function main() {
    console.log('🌱 Seeding database...');

    // ── Usuário Admin ─────────────────────────────────────
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await prisma.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {},
        create: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });

    console.log(`✅ Usuário admin criado: ${admin.email}`);

    // ── Grupos e Contas ───────────────────────────────────
    const groupsData = [
        {
            name: 'Alimentação',
            order: 1,
            accounts: [
                { name: 'Mercado', order: 1 },
                { name: 'Padaria', order: 2 },
                { name: 'Feira', order: 3 },
            ],
        },
        {
            name: 'Despesas com a Sala',
            order: 2,
            accounts: [
                { name: 'Aluguel', order: 1 },
                { name: 'Luz', order: 2 },
                { name: 'Condomínio', order: 3 },
                { name: 'Internet', order: 4 },
            ],
        },
        {
            name: 'Operação',
            order: 3,
            accounts: [
                { name: 'Papel', order: 1 },
                { name: 'Clips', order: 2 },
                { name: 'Toner de Impressora', order: 3 },
                { name: 'Material de Escritório', order: 4 },
            ],
        },
    ];

    for (const groupData of groupsData) {
        const group = await prisma.group.upsert({
            where: { id: groupData.name }, // will fail, so create
            update: { name: groupData.name, order: groupData.order },
            create: {
                name: groupData.name,
                order: groupData.order,
                userId: admin.id,
                accounts: {
                    create: groupData.accounts,
                },
            },
        });

        console.log(`✅ Grupo criado: ${group.name}`);
    }

    console.log('🎉 Seed concluído!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
