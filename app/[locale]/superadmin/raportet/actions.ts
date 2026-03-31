"use server";

import { prisma } from "../../../../lib/prisma";

export async function getFinancialStats() {
  // Marrim të gjitha pagesat e bëra ndaj platformës (sa_payments)
  const allPayments = await prisma.sa_payments.findMany({
    include: { 
      businesses: { 
        select: { name: true, city: true } 
      } 
    },
    orderBy: { created_at: 'desc' }
  });

  // 1. Fitimi Total (vetëm ato që janë 'completed')
  const totalEarnings = allPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // 2. Pagesat në pritje (pending)
  const pendingAmount = allPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // 3. Fitimi i këtij muaji
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyEarnings = allPayments
    .filter(p => p.status === 'completed' && new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    payments: JSON.parse(JSON.stringify(allPayments)),
    stats: {
      totalEarnings,
      pendingAmount,
      monthlyEarnings,
      transactionCount: allPayments.length
    }
  };
}