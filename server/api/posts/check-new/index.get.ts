export default defineEventHandler(async (event) => {
    const cookies = parseCookies(event);
    const lastVisit = cookies.lastVisit;
    const prisma = usePrisma();

    if (!lastVisit) {
      // No last visit recorded, assume no new posts
      return { newPostAvailable: false };
    }
  
    const lastVisitDate = new Date(lastVisit);
  
    // Example: find posts newer than last visit
    const newPosts = await prisma.post.findMany({
      where: {
        date: {
          gt: lastVisitDate,
        },
      },
    });
  
    return { newPostAvailable: newPosts.length > 0 };
});