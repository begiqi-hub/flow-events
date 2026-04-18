"use server";

import { prisma } from "../../../../lib/prisma";

export async function getFinancialStats() {
  // Marrim VETËM pagesat e bëra me sukses (completed)
  const allPayments = await prisma.sa_payments.findMany({
    where: { status: 'completed' },
    include: { 
      businesses: { 
        select: { name: true, city: true, country: true } 
      } 
    },
    orderBy: { created_at: 'desc' }
  });

  // 1. Fitimi Total
  const totalEarnings = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // 2. Fitimi i këtij muaji
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyEarnings = allPayments
    .filter(p => new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    payments: JSON.parse(JSON.stringify(allPayments)),
    stats: {
      totalEarnings,
      monthlyEarnings,
      transactionCount: allPayments.length
    }
  };
}