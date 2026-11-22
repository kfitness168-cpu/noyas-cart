// Keep the server code private: never serve files under /functions as static files.
export const onRequest = () => new Response("Not found", { status: 404 });
