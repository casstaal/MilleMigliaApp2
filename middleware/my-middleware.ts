export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === '/login') return;

  const nuxtApp = useNuxtApp();

  const { getSession } = useAuth();

  const session = await getSession();

  if (!session?.user) {
    return navigateTo('/login');
  }
});
