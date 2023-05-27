import getSession from "@/app/actions/getSession";
import prisma from "@/app/libs/prismadb";

const getUsers = async () => {
  const session = await getSession();

  if (!session?.user?.email) {
    return [];
  }

  // you would not chat to yourself!
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    });

    return users;
  } catch (error: any) {
    return [];
  }
};

export default getUsers;
