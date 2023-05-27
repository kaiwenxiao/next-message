// import { NextResponse } from "next/server";
// import getCurrentUser from "@/app/actions/getCurrentUser";
// import prisma from "@/app/libs/prismadb";
// import { pusherServer } from "@/app/libs/pusher";
//
// export async function POST(request: Request) {
//   try {
//     const currentUser = await getCurrentUser();
//     const body = await request.json();
//     const { message, image, conversationId } = body;
//
//     if (!currentUser?.id || !currentUser?.email) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
//
//     const newMessage = await prisma.message.create({
//       data: {
//         body: message,
//         image,
//         conversation: {
//           connect: {
//             id: conversationId,
//           },
//         },
//         // find prisma message table record which id === currentUser.id, assign the value to senderId
//         // this will return a property of respond called 'senderId'
//         sender: {
//           connect: {
//             id: currentUser.id,
//           },
//         },
//         seen: {
//           connect: {
//             id: currentUser.id,
//           },
//         },
//       },
//       include: {
//         // when we return the response, will return the message table record (or alias instance) that we found
//         seen: true,
//         sender: true,
//       },
//     });
//
//     const updatedMessage = await prisma.conversation.update({
//       where: {
//         id: conversationId,
//       },
//       data: {
//         lastMessageAt: new Date(),
//         messages: {
//           connect: {
//             id: newMessage.id,
//           },
//         },
//       },
//       include: {
//         users: true,
//         messages: {
//           include: {
//             seen: true,
//           },
//         },
//       },
//     });
//
//     await pusherServer.trigger(conversationId, "messages:new", newMessage);
//     const lastMessage =
//       updatedConversation.messages[updatedConversation.messages.length - 1];
//     updatedConversation.users.map((user) => {
//       pusherServer.trigger(user.email!, "conversation:update", {
//         id: conversationId,
//         messages: [lastMessage],
//       });
//     });
//
//     await pusherServer.trigger(currentUser.email, "conversation:update", {
//       id: conversationId,
//       messages: [updatedMessage],
//     });
//
//     if (lastMessage.seenIds.indexOf(currentUser.id) === -1) {
//       return NextResponse.json(conversation);
//     }
//     return NextResponse.json(newMessage);
//   } catch (error: any) {
//     console.log(error, "ERROR_MESSAGES");
//     return new NextResponse("InternalError", { status: 500 });
//   }
// }
import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { message, image, conversationId } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newMessage = await prisma.message.create({
      include: {
        seen: true,
        sender: true,
      },
      data: {
        body: message,
        image: image,
        conversation: {
          connect: { id: conversationId },
        },
        sender: {
          connect: { id: currentUser.id },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessage],
      });
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.log(error, "ERROR_MESSAGES");
    return new NextResponse("Error", { status: 500 });
  }
}
