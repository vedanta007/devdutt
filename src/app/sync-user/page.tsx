import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

const SyncUser = async() => {
  const {userId} = await auth()
  if(!userId) {
    throw new Error("User not found")
  }
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  if(!user.emailAddresses[0]?.emailAddress) {
    return notFound()
  }
  await db.user.upsert({
    where: {emailAdress: user.emailAddresses[0]?.emailAddress ?? ""},
    update: {
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl
    },
    create: {
      emailAdress: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      id: user.id
    }
  })
  return redirect("/dashboard")
}

export default SyncUser;