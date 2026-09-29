import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "sample",
        passwordHash: await bcrypt.hash("sample1234", 12),
      },
    });

    await prisma.userSettings.create({
      data: {
        userId: user.id,
        dayStartMin: 360,
        dayEndMin: 1380,
        timerRoundingMin: 0,
      },
    });
  }

  const area = await prisma.area.upsert({
    where: {
      id: `seed-area-${user.id}`,
    },
    update: {
      name: "Health",
      order: 0,
    },
    create: {
      id: `seed-area-${user.id}`,
      userId: user.id,
      name: "Health",
      order: 0,
    },
  });

  const project = await prisma.project.upsert({
    where: {
      id: `seed-project-${user.id}`,
    },
    update: {
      name: "Strength Training",
      areaId: area.id,
      order: 0,
    },
    create: {
      id: `seed-project-${user.id}`,
      userId: user.id,
      areaId: area.id,
      name: "Strength Training",
      order: 0,
    },
  });

  const task = await prisma.task.upsert({
    where: {
      id: `seed-task-${user.id}`,
    },
    update: {
      title: "Workout Session",
      projectId: project.id,
      tags: ["fitness", "energy"],
      defaultEstimateMin: 60,
    },
    create: {
      id: `seed-task-${user.id}`,
      userId: user.id,
      projectId: project.id,
      title: "Workout Session",
      notes: "Example seeded task",
      tags: ["fitness", "energy"],
      defaultEstimateMin: 60,
    },
  });

  const goal = await prisma.goal.upsert({
    where: {
      id: `seed-goal-${user.id}`,
    },
    update: {
      name: "Daily Fitness",
      targetMin: 60,
      matchType: "TAG",
      matchTagNames: ["fitness"],
      showOnDashboard: true,
    },
    create: {
      id: `seed-goal-${user.id}`,
      userId: user.id,
      name: "Daily Fitness",
      scope: "DAILY",
      targetMin: 60,
      matchType: "TAG",
      matchTagNames: ["fitness"],
      matchProjectIds: [project.id],
      matchTaskIds: [task.id],
      showOnDashboard: true,
    },
  });

  await prisma.dashboardWidget.upsert({
    where: {
      userId_goalId: {
        userId: user.id,
        goalId: goal.id,
      },
    },
    update: {
      sortOrder: 0,
      visible: true,
      displayMode: "ACTUAL",
    },
    create: {
      userId: user.id,
      goalId: goal.id,
      sortOrder: 0,
      visible: true,
      displayMode: "ACTUAL",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



