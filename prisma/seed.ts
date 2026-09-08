import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const writer = await prisma.user.upsert({
    where: { email: "writer@example.com" },
    update: {},
    create: {
      name: "Jane Writer",
      email: "writer@example.com",
      password: passwordHash,
      role: "WRITER",
    },
  });

  const categories = await Promise.all(
    ["World", "Business", "Technology", "Sports", "Culture"].map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase() },
        update: {},
        create: { name, slug: name.toLowerCase() },
      })
    )
  );

  await prisma.article.upsert({
    where: { slug: "welcome-to-the-daily-wire-post" },
    update: {},
    create: {
      title: "Welcome to The Daily Wire Post",
      slug: "welcome-to-the-daily-wire-post",
      excerpt: "This is your first published article — edit or delete it from the dashboard.",
      content:
        "<p>This is a sample published article, seeded automatically so your homepage isn't empty. Sign in as <strong>admin@example.com</strong> / <strong>password123</strong> to publish real stories.</p>",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: categories[0].id,
      metaTitle: "Welcome to The Daily Wire Post",
      metaDescription: "This is your first published article.",
    },
  });

  console.log({ admin: admin.email, writer: writer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
