export const logout = async (accessToken: string) => {
  await fetch("https://be-paper-dot.store/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken as string}`,
    },
    credentials: "include",
  });
};
