import { AgentReviewStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hash("admin123456", 10);
  const alphaPasswordHash = await hash("alpha123456", 10);
  const betaPasswordHash = await hash("beta123456", 10);

  await prisma.session.deleteMany();
  await prisma.usageLog.deleteMany();
  await prisma.template.deleteMany();
  await prisma.agentCodeType.deleteMany();
  await prisma.code.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.codeType.deleteMany();

  const monthlyCard = await prisma.codeType.create({
    data: {
      name: "Monthly Card",
      slug: "monthly-card",
      description: "Standard monthly subscription code.",
      defaultTemplate: "【Monthly Card】\nCode: {code}\nPlease redeem within 24 hours.",
      codes: {
        createMany: {
          data: [
            { value: "MONTH-1001", importBatch: "seed-batch-a" },
            { value: "MONTH-1002", importBatch: "seed-batch-a" },
            { value: "MONTH-1003", importBatch: "seed-batch-a" },
          ],
        },
      },
    },
  });

  const premiumCard = await prisma.codeType.create({
    data: {
      name: "Premium Pass",
      slug: "premium-pass",
      description: "Premium code for high-tier agents.",
      defaultTemplate: "Premium Access\nActivation code: {code}",
      codes: {
        createMany: {
          data: [
            { value: "PREM-2001", importBatch: "seed-batch-b" },
            { value: "PREM-2002", importBatch: "seed-batch-b" },
          ],
        },
      },
    },
  });

  const alpha = await prisma.agent.create({
    data: {
      name: "Alpha Reseller",
      username: "alpha",
      passwordHash: alphaPasswordHash,
      reviewStatus: AgentReviewStatus.APPROVED,
      reviewedAt: new Date(),
      dailyLimit: 0,
      monthlyLimit: 0,
      totalLimit: 0,
    },
  });

  const beta = await prisma.agent.create({
    data: {
      name: "Beta Partner",
      username: "beta",
      passwordHash: betaPasswordHash,
      reviewStatus: AgentReviewStatus.APPROVED,
      reviewedAt: new Date(),
      dailyLimit: 0,
      monthlyLimit: 0,
      totalLimit: 0,
    },
  });

  await prisma.agentCodeType.createMany({
    data: [
      {
        agentId: alpha.id,
        codeTypeId: monthlyCard.id,
        dailyLimit: 5,
        monthlyLimit: 60,
        totalLimit: 500,
      },
      {
        agentId: alpha.id,
        codeTypeId: premiumCard.id,
        dailyLimit: 2,
        monthlyLimit: 20,
        totalLimit: 100,
      },
      {
        agentId: beta.id,
        codeTypeId: monthlyCard.id,
        dailyLimit: 2,
        monthlyLimit: 20,
        totalLimit: 80,
      },
    ],
  });

  await prisma.template.create({
    data: {
      agentId: alpha.id,
      codeTypeId: premiumCard.id,
      content: "Alpha Premium Delivery\nRedeem code: {code}\nNeed help? Contact Alpha support.",
    },
  });

  await prisma.adminUser.create({
    data: {
      name: "System Admin",
      username: "admin",
      passwordHash: adminPasswordHash,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
